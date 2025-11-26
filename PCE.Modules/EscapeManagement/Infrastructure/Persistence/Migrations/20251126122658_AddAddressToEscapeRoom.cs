using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PCE.Modules.EscapeManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressToEscapeRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "EscapeRooms",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "EscapeRooms");
        }
    }
}
