namespace TicketingSystem.Model.DTO.Ticket
{
    public class UpdateTicket
    {
        public string subject { get; set; }
        public string description { get; set; }
        public int status_id { get; set; }
        public int priority_id { get; set; }
        public int user_id { get; set; }
        public int? agent_id { get; set; }
        public DateTime? updated_at { get; set; } = DateTime.UtcNow;
    }
}
