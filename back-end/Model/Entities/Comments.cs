using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketingSystem.Model.Entities
{
    public class Comments
    {
        public int id { get; set; }
        public int ticket_id { get; set; }
        public int user_id { get; set; }
        public string content { get; set; } = string.Empty;
        public DateTime created_at { get; set; }
        public virtual Users? Users { get; set; }
        public virtual Tickets? Tickets { get; set; }
    }
}
