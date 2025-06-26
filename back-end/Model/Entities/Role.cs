using System.ComponentModel.DataAnnotations;

namespace TicketingSystem.Model.Entities
{
    public class Role
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public ICollection<Users>? Users { get; set; }
    }
}
