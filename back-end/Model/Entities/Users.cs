using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Model.Entities
{
    public class Users
    {
        public int id { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password_hash { get; set; } = string.Empty;
        public int? role_id { get; set; }
        public int? department_id { get; set; }
        public DateTime? created_at { get; set; }
        public Role? Role { get; set; }
        public Department? Department { get; set; }
        public ICollection<Tickets>? TicketsCreated { get; set; }
        public ICollection<Tickets>? TicketsAssigned { get; set; }
        public ICollection<Comments>? Comments { get; set; }

    }
}