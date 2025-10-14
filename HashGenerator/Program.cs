using BCrypt.Net;

namespace HashGenerator;

class Program
{
    static void Main(string[] args)
    {
        string password = "password123";
        string hash = BCrypt.Net.BCrypt.HashPassword(password, 12);
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"BCrypt Hash: {hash}");
    }
}