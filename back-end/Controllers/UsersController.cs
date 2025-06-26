using AutoMapper;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Model.DTO.User;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UsersController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getData()
        {
            var result = _context.users
                .Include(s => s.Role)
                .Include(s => s.Department)
                .Select(s => new
                {
                    id = s.id,
                    name = s.name,
                    email = s.email,
                    role_id = s.role_id,
                    role = s.Role.name,
                    department_id = s.id,
                    department = s.Department.name,
                    created = s.created_at
                });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getDataById(int id)
        {
            var result = _context.users.Find(id);
            if (result is null) return NotFound("Data not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult createData(CreateUser createDTO)
        {
            try
            {
                var entity = new Users
                {
                    name = createDTO.name,
                    email = createDTO.email,
                    password_hash = BCrypt.Net.BCrypt.HashPassword(createDTO.password),
                    created_at = DateTime.UtcNow
                };

                _context.users.Add(entity);
                _context.SaveChanges();
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Data: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPatch("{id}")]
        public IActionResult updateData(int id, [FromBody] UpdateUser updateDTO)
        {
            try
            {
                var entity = _context.users.Find(id);
                if (entity == null) return NotFound("Data not found");

                _mapper.Map(updateDTO, entity);
                _context.SaveChanges();

                return Ok(entity);
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error updating Data: {ex.Message}");
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult DeleteData(int id)
        {
            try
            {
                var ent = _context.users.Find(id);

                if (ent == null) return NotFound("Data not found");

                _context.users.Remove(ent);
                _context.SaveChanges();
                return Ok(ent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting Data: {ex.Message}");
            }
        }
    }
}
