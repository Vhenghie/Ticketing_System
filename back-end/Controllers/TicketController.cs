using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Model.DTO.Ticket;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TicketController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getData()
        {
            var result = _context.tickets
                .Include(s => s.Priority)
                .Include(s => s.Status)
                .Include(s => s.Requester)
                .Include(s => s.Agent)
                .Select(s => new
                {
                    ticket_id = s.id,
                    ticket_subject = s.subject,
                    ticket_description = s.description,
                    ticket_status_id = s.status_id,
                    ticket_status_name = s.Status.name,
                    ticket_priority_id = s.priority_id,
                    ticket_priority_name = s.Priority.name,
                    ticket_user_id = s.user_id,
                    ticket_user_name = s.Requester.name,
                    ticket_agent_id = s.agent_id,
                    ticket_agent_name = s.Agent.name,
                    ticket_created_at = s.created_at,
                    ticket_updated_at = s.updated_at
                });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getDataById(int id)
        {
            var result = _context.tickets.Find(id);
            if (result is null) return NotFound("Data not found!");
            return Ok(result);
        }

        [HttpGet("user_tickets/{user_id}")] 
        public IActionResult getDataByUsers(int user_id)
        {
            var result = _context.tickets
                .Include(s => s.Priority)
                .Include(s => s.Status)
                .Include(s => s.Requester)
                .Include(s => s.Agent)
                .Where(s => s.user_id == user_id || s.agent_id == user_id)
                .Select(s => new
                {
                    ticket_id = s.id,
                    ticket_subject = s.subject,
                    ticket_description = s.description,
                    ticket_status_id = s.status_id,
                    ticket_status_name = s.Status.name,
                    ticket_priority_id = s.priority_id,
                    ticket_priority_name = s.Priority.name,
                    ticket_user_id = s.user_id,
                    ticket_user_name = s.Requester.name,
                    ticket_agent_id = s.agent_id,
                    ticket_agent_name = s.Agent.name,
                    ticket_created_at = s.created_at,
                    ticket_updated_at = s.updated_at
                });
            return Ok(result);
        }

        [HttpPost]
        public IActionResult createData(CreateTicket createDTO)
        {
            try
            {
                var entity = new Tickets
                {
                    subject = createDTO.subject,
                    description = createDTO.description,
                    status_id = createDTO.status_id,
                    priority_id = createDTO.priority_id,
                    user_id = createDTO.user_id,
                    agent_id = createDTO.agent_id,
                    created_at = DateTime.UtcNow
                };

                _context.tickets.Add(entity);
                _context.SaveChanges();
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Data: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateData(int id, [FromBody] UpdateTicket updateDTO)
        {
            try
            {
                var entity = _context.tickets.Find(id);
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
                var ent = _context.tickets.Find(id);

                if (ent == null) return NotFound("Data not found");

                _context.tickets.Remove(ent);
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
