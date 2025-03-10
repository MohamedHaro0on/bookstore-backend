# Online Bookstore (E-commerce Platform) - MEAN Stack Project

## Project Overview
This project simulates a real-life e-commerce platform where users can browse books, add them to a cart, and place orders. The backend is built with Node.js, Express.js, and MongoDB, and demonstrates robust API design, secure authentication with JWT, and advanced middleware usage. While the original plan included a full Angular frontend, this implementation focuses solely on the backend.

## Project Features

### Backend (Node.js + Express.js + MongoDB)
- **User Authentication and Authorization**
  - Users can register, log in, and log out.
  - JWT is used to secure endpoints.
  - Role-based access control is implemented (e.g., admin vs. regular user).

- **RESTful API Design**
  - Endpoints for:
    - User management (registration, login, profile update)
    - Book management (CRUD operations for books; admin-only routes)
    - Cart management (add/remove books, view cart)
    - Order management (place orders, view order history)
    - Review management (submit, view, update, delete reviews)

- **Database Design**
  - Schemas and models defined with Mongoose:
    - **User:** Contains name, email, hashed password, role.
    - **Book:** Includes title, author, price, description, stock, reviews, and image reference.
    - **Order:** Associates a user with books, total price, and order status.
    - **Review:** Connects a user and a book with rating, review text, and creation date.
  - Proper indexing and relations are set up to optimize performance.
  - An ERD is provided in the project documentation.

- **Middleware**
  - **Authentication Middleware:** Validates JWT tokens for protected routes.
  - **Error Handling Middleware:** Centralizes error responses.
  - **Logging Middleware:** Logs incoming requests to a file using libraries like `winston` and `morgan`.

- **Advanced Features**
  - **Password Security:** Uses `bcrypt.js` to hash passwords before storage.
  - **Pagination and Filtering:** Implements server-side pagination and filtering for book listings.
  - **Transactions:** Ensures atomicity during order placement (reducing book stock and creating orders together).
  - **File Handling:** Allows admins to upload book cover images using `multer`, with Express serving static files.
  - **Validation:** Uses Mongoose and external libraries (Joi) for comprehensive schema validation.
  - **Caching with Redis:** Redis is integrated to cache frequently accessed data (like the book list), reducing load on MongoDB and improving response times.
  - **Payment Integration:** Integrated Stripe for secure payment processing during checkout.
  - **Email Notifications:** Used nodemailer to send email activation notifications to users upon registration.

## Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v12 or above)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [Redis](https://redis.io/) (local installation or via a hosted service)
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MohamedHaro0on/bookstore-backend.git
   cd bookstore-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the project root:
   ```env

   PORT=3000
   NODE_ENV= development
   DB_Name = bookstore

   db_password = your_mongoDB_password
   DB_URI = your_mongoDB_uri
   email_password=your_pass
   email_user_name=your_email

   ACCESS_TOKEN_EXPIRY=1h
   REFRESH_TOKEN_EXPIRY=90d
   REFRESH_TOKEN_DAYS=90d

   ACCESS_TOKEN_SECRET="your_acess_secret_token"
   REFRESH_TOKEN_SECRET="your_refresh_token"
   EMAIL_SECRET_KEY="your_email_token"

   PUBLISHABLE_KEY="your_Publishable_key"
   SECRET_KEY="your_secret_key"

   REDIS_URL = 'redis://localhost:6379'
   ```

1. **Run the Server**
   - Start the server:
     ```bash
     npm run start:dev
     ```

2. **API Documentation**
   A Postman collection is provided in the `/docs` directory for testing the API endpoints.

## Deployment
- **AWS Deployment with Terraform & Ansible:**
  - The project is deployed on AWS using Terraform for infrastructure provisioning and Ansible for configuration management.
  - Terraform configuration files can be found in the `Terraform/` directory.
  - Ansible playbooks and configuration files are available in the `Ansible/` directory.
  - Ensure that AWS credentials and required environment variables are set up prior to deployment.

## Conclusion
This project demonstrates a full-featured backend for an online bookstore, incorporating modern web development practices such as RESTful API design, secure authentication, and scalable database management. Feel free to fork the repository, contribute, and deploy your own version of this project.
