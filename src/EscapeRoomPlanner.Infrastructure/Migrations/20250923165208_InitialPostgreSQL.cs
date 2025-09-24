using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EscapeRoomPlanner.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EscapeRooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Address_Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address_City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location_Latitude = table.Column<double>(type: "double precision", precision: 10, scale: 8, nullable: false),
                    Location_Longitude = table.Column<double>(type: "double precision", precision: 11, scale: 8, nullable: false),
                    EstimatedDuration = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Difficulty = table.Column<string>(type: "text", nullable: false),
                    PriceRange_MinPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PriceRange_MaxPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PriceRange_Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Schedule_WeeklySchedule = table.Column<string>(type: "jsonb", nullable: false),
                    Schedule_SpecialDates = table.Column<string>(type: "jsonb", nullable: false),
                    ContactInfo_Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ContactInfo_Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContactInfo_Website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GooglePlaces_PlaceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GooglePlaces_Rating = table.Column<double>(type: "double precision", precision: 3, scale: 2, nullable: true),
                    GooglePlaces_ReviewCount = table.Column<int>(type: "integer", nullable: true),
                    GooglePlaces_LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EscapeRooms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Draft"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyRoutes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    EstimatedTotalTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m),
                    PreferredTransportMode = table.Column<string>(type: "text", nullable: false, defaultValue: "Driving"),
                    MultiModalStrategy = table.Column<string>(type: "text", nullable: false, defaultValue: "SingleMode"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyRoutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyRoutes_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RouteStops",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EscapeRoomId = table.Column<Guid>(type: "uuid", nullable: false),
                    DailyRouteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    EstimatedArrivalTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EstimatedTravelTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TransportModeToNext = table.Column<string>(type: "text", nullable: true),
                    IsMultiModalSegment = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteStops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RouteStops_DailyRoutes_DailyRouteId",
                        column: x => x.DailyRouteId,
                        principalTable: "DailyRoutes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RouteStops_EscapeRooms_EscapeRoomId",
                        column: x => x.EscapeRoomId,
                        principalTable: "EscapeRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyRoutes_Date",
                table: "DailyRoutes",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_DailyRoutes_PlanId",
                table: "DailyRoutes",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyRoutes_PlanId_Date",
                table: "DailyRoutes",
                columns: new[] { "PlanId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EscapeRooms_Difficulty",
                table: "EscapeRooms",
                column: "Difficulty");

            migrationBuilder.CreateIndex(
                name: "IX_EscapeRooms_IsActive",
                table: "EscapeRooms",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_EscapeRooms_Name",
                table: "EscapeRooms",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_CreatedAt",
                table: "Plans",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_CreatedBy",
                table: "Plans",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_StartDate_EndDate",
                table: "Plans",
                columns: new[] { "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Plans_Status",
                table: "Plans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_DailyRouteId",
                table: "RouteStops",
                column: "DailyRouteId");

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_DailyRouteId_EscapeRoomId",
                table: "RouteStops",
                columns: new[] { "DailyRouteId", "EscapeRoomId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_DailyRouteId_Order",
                table: "RouteStops",
                columns: new[] { "DailyRouteId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_EscapeRoomId",
                table: "RouteStops",
                column: "EscapeRoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RouteStops");

            migrationBuilder.DropTable(
                name: "DailyRoutes");

            migrationBuilder.DropTable(
                name: "EscapeRooms");

            migrationBuilder.DropTable(
                name: "Plans");
        }
    }
}
