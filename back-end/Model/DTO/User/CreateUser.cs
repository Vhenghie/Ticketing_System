namespace TicketingSystem.Model.DTO.User
{ 
    public class CreateUser
    {
        public required string name { get; set; }
        public required string email { get; set; }
        public required string password { get; set; }
    }
}
