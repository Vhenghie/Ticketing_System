using System.ComponentModel.DataAnnotations;

namespace TicketingSystem.Model.Entities
{
    public class Priority
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public ICollection<Tickets>? Tickets { get; set; }
    }
}
