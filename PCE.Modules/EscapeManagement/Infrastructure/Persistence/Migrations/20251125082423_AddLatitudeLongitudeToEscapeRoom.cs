using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PCE.Modules.EscapeManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLatitudeLongitudeToEscapeRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "EscapeRooms",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "EscapeRooms",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "EscapeRooms");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "EscapeRooms");
        }
    }
}
