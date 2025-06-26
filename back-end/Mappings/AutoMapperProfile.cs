using AutoMapper;
using TicketingSystem.Model.DTO.Comment;
using TicketingSystem.Model.DTO.Department;
using TicketingSystem.Model.DTO.Priority;
using TicketingSystem.Model.DTO.Role;
using TicketingSystem.Model.DTO.Status;
using TicketingSystem.Model.DTO.Ticket;
using TicketingSystem.Model.DTO.User;
using TicketingSystem.Model.Entities;

namespace TicketingSystem.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<UpdateComment, Comments>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateDepartment, Department>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdatePriority, Priority>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null || srcMember == null));

            CreateMap<UpdateStatus, Status>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateUser, Users>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateTicket, Tickets>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateRole, Role>()
              .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
