using System.ComponentModel.DataAnnotations.Schema;

namespace TicketingSystem.Model.DTO.User
{
    public class UpdateUser
    {
        public string? name { get; set; }
        public string? email { get; set; }
        public string? password_hash { get; set; }
        public int? role_id { get; set; }
        public int? department_id { get; set; }
    }
}
