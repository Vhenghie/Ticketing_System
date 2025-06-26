using System.ComponentModel.DataAnnotations.Schema;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Model.DTO.Comment
{
    public class CreateComment
    {
        public required int ticket_id { get; set; }
        public required int user_id { get; set; }
        public required string content { get; set; }
    }
}
