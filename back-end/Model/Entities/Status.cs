using System.ComponentModel.DataAnnotations;

namespace TicketingSystem.Model.Entities
{
    public class Status
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public ICollection<Tickets>? Tickets { get; set; }
    }
}
