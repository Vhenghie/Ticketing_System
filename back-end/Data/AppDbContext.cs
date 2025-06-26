using Microsoft.EntityFrameworkCore;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Comments> comments { get; set; }
        public DbSet<Department> department { get; set; }
        public DbSet<Priority> priority { get; set; }
        public DbSet<Role> role { get; set; }
        public DbSet<Status> status { get; set; }
        public DbSet<Tickets> tickets { get; set; }
        public DbSet<Users> users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // USERS

            modelBuilder.Entity<Users>()
                .HasOne(u => u.Role)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.role_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Users>()
                .HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.department_id)
                .OnDelete(DeleteBehavior.Restrict);

            // TICKETS

            modelBuilder.Entity<Tickets>()
                .HasOne(t => t.Requester)
                .WithMany(u => u.TicketsCreated)
                .HasForeignKey(t => t.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tickets>()
                .HasOne(t => t.Agent)
                .WithMany(u => u.TicketsAssigned)
                .HasForeignKey(t => t.agent_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tickets>()
                .HasOne(t => t.Status)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.status_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tickets>()
                .HasOne(t => t.Priority)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.priority_id)
                .OnDelete(DeleteBehavior.Restrict);

            // COMMENTS

            modelBuilder.Entity<Comments>()
                .HasOne(c => c.Tickets)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.ticket_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comments>()
                .HasOne(c => c.Users)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}
