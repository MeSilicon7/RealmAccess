# RealmAccess

This project is a hobby project with the main purpose of utilizing Cloudflare D1 and RemixJS on Cloudflare Pages. It uses `d1-auto-migrate.ts` for database migration, Prisma for ORM, and Cloudflare's native database methods for querying.

![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)
**upcoming**

## Features

- Users can see text based on their roles.
- By default, when users register, they don't have roles.
- An admin assigns roles to users from the database, creates roles, and assigns role-based secret texts.
- An expiration date is added for users to track their expiration.

## Technologies Used

- **Cloudflare D1**: For database management.
- **RemixJS**: For building the web application.
- **Prisma**: For ORM.
- **Cloudflare Native Database Methods**: For querying the database.

## Important Notes

- Cloudflare D1 remote database does not work in local development when using Cloudflare Pages.

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository.
2. Install the dependencies using `bun install`.
3. Set up your environment variables in a `.env` file.
4. Rename `wrangler.example.toml` to `wrangler.toml` and set the necessary configuration:
    ```toml
    name = "realmaccess"
    compatibility_date = "2024-11-12"
    pages_build_output_dir = "./build/client"

    [[d1_databases]]
    binding = "DB"
    database_name = "test_prisma"
    database_id = "c74c2f94-f157-4d83-a140-f81ce916a0ca"
    ```
5. Run the database migrations using `d1-auto-migrate.ts`.
6. Start the development server using `bun run dev`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.