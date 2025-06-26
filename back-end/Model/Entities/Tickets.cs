using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketingSystem.Model.Entities
{
    public class Tickets
    {
        public int id { get; set; }
        public string subject { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;

        public int status_id { get; set; }
        public int priority_id { get; set; }

        public int user_id { get; set; }
        public int? agent_id { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }

        public Status? Status { get; set; }
        public Priority? Priority { get; set; }

        public Users? Requester { get; set; }
        public Users? Agent { get; set; }

        public ICollection<Comments>? Comments { get; set; }
    }
}
