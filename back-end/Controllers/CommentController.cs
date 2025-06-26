using System.Xml.Linq;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Model.DTO.Comment;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CommentController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getData()
        {
            var result = _context.comments.ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getDataById(int id)
        {
            var result = _context.comments
                .Include(s => s.Users)
                .Where(s => s.ticket_id == id)
                .Select( s => new {
                    comment_id = s.id,
                    comment_ticket_id = s.ticket_id,
                    comment_user_id = s.user_id,
                    comment_user_name = s.Users.name,
                    comment_content = s.content,
                    comment_created_at = s.created_at
                });
            
            if (result is null) return NotFound("Data not found!");

            return Ok(result);
        }

        [HttpPost]
        public IActionResult createData(CreateComment createDTO)
        {
            try
            {
                var entity = new Comments
                {
                    ticket_id = createDTO.ticket_id,
                    user_id = createDTO.user_id,
                    content = createDTO.content,
                    created_at = DateTime.UtcNow
                };

                _context.comments.Add(entity);
                _context.SaveChanges();
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Data: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateData(int id, [FromBody] UpdateComment updateDTO)
        {
            try
            {
                var entity = _context.comments.Find(id);
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

        [HttpDelete("{id}")]
        public IActionResult DeleteData(int id)
        {
            try
            {
                var ent = _context.comments.Find(id);

                if (ent == null) return NotFound("Data not found");

                _context.comments.Remove(ent);
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
