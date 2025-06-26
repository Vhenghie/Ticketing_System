using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketingSystem.Data;
using TicketingSystem.Model.DTO.Department;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public DepartmentController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getData()
        {
            var result = _context.department.ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getDataById(int id)
        {
            var result = _context.department.Find(id);
            if (result is null) return NotFound("Data not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult createData(CreateDepartment createDTO)
        {
            try
            {
                var entity = new Department
                {
                    name = createDTO.name
                };

                _context.department.Add(entity);
                _context.SaveChanges();
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Data: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateData(int id, [FromBody] UpdateDepartment updateDTO)
        {
            try
            {
                var entity = _context.department.Find(id);
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
                var ent = _context.department.Find(id);

                if (ent == null) return NotFound("Data not found");

                _context.department.Remove(ent);
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
