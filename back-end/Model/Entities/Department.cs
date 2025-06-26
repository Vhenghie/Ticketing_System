using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketingSystem.Model.Entities
{
    public class Department
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public ICollection<Users>? Users { get; set; }
    }
}
