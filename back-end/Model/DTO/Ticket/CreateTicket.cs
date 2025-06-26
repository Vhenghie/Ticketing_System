using System.ComponentModel.DataAnnotations.Schema;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Model.DTO.Ticket
{
    public class CreateTicket
    {
        public required string subject { get; set; }
        public required string description { get; set; }
        public required int status_id { get; set; }
        public required int priority_id { get; set; }
        public required int user_id { get; set; }
        public int? agent_id { get; set; }
    }
}
