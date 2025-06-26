using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;

namespace TicketingSystem.Controllers
{
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
        }

        [HttpGet]
        [Route("top_selling_products")]
        public IActionResult GetTopSellingProducts()
        {
            var result = new List<object>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = @"
                SELECT TOP 10
                    p.products_name,
                        SUM(s.sales_total_price) AS Total_Revenue,
                    SUM(s.sales_unit_value) AS Units_Sold
                FROM sales s
                JOIN products p ON s.sales_product_id = p.products_id
                GROUP BY p.products_name
                ORDER BY Total_Revenue DESC";

                _context.Database.OpenConnection();

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        result.Add(new
                        {
                            ProductsName = reader.GetString(0),
                            TotalRevenue = reader.GetDecimal(1),
                            UnitsSold = reader.GetDecimal(2)
                        });
                    }
                }
            }

            return Ok(result);
        }
    }
}
