using Microsoft.AspNetCore.Mvc;
using TicketingSystem.Data;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Model.DTO.User;
using TicketingSystem.Data;
using TicketingSystem.Services;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace TicketingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtTokenService _jwtTokenService;

        public AuthenticationController(AppDbContext context, JwtTokenService jwtTokenService)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(Login dto)
        {
            var acc = await _context.users.FirstOrDefaultAsync(a => a.email == dto.email);
            if (acc == null)
                return Unauthorized(new { isValid = false, message = "Invalid email or password." });

            bool isValidPassword = BCrypt.Net.BCrypt.Verify(dto.password, acc.password_hash);
            if (!isValidPassword)
                return Unauthorized(new { isValid = false, message = "Invalid email or password." });

            var token = _jwtTokenService.GenerateToken(acc.email);

            var acc_type = await _context.role.FirstOrDefaultAsync(a => a.id == acc.role_id);

            return Ok(new { token, message = "Login Successful!", user_id = acc.id, user_type = acc_type.name });
        }



        [HttpPatch("updatePassword/{id}")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] ChangePassword dto)
        {
            try
            {
                var user = await _context.users.FindAsync(id);
                user.password_hash = BCrypt.Net.BCrypt.HashPassword(dto.password);

                _context.users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Password updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("verifyPassword/{id}/{password}")]
        public async Task<IActionResult> VerifyPassword(int id, string password)
        {
            try
            {
                var user = await _context.users.FindAsync(id);
                if (user == null)
                    return NotFound(new { isValid = false, message = "User not found." });

                bool isValid = BCrypt.Net.BCrypt.Verify(password, user.password_hash);

                return Ok(new
                {
                    isPasswordValid = isValid,
                    message = isValid ? "Password verified" : "Incorrect password"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("verifyToken")]
        public IActionResult VerifyToken()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader))
                    return Unauthorized(new { isValid = false, code = "MISSING_HEADER", message = "Authorization header is missing" });

                if (!authHeader.StartsWith("Bearer "))
                    return Unauthorized(new { isValid = false, code = "INVALID_FORMAT", message = "Authorization header must start with 'Bearer '" });

                var token = authHeader["Bearer ".Length..].Trim();
                if (string.IsNullOrEmpty(token))
                    return Unauthorized(new { isValid = false, code = "EMPTY_TOKEN", message = "Token cannot be empty" });

                var principal = _jwtTokenService.ValidateToken(token);
                if (principal == null)
                    return Unauthorized(new { isValid = false, code = "INVALID_TOKEN", message = "Invalid or expired token" });

                var emailClaim = principal.FindFirst(ClaimTypes.Email);
                if (emailClaim == null)
                    return Unauthorized(new { isValid = false, code = "MISSING_EMAIL", message = "Token is missing email claim" });

                var expiresAt = _jwtTokenService.GetTokenExpiration(token);

                return Ok(new
                {
                    isValid = true,
                    email = emailClaim.Value,
                    expiresAt,
                    message = "Token is valid"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isValid = false,
                    code = "SERVER_ERROR",
                    message = $"An error occurred: {ex.Message}"
                });
            }
        }
    }
}
