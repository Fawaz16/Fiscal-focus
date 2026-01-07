# 📚 Fiscal Focus Backend API Documentation

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users & Dashboard](#users--dashboard-endpoints)
   - [Balance Management](#balance-management-endpoints)
   - [Budgets](#budgets-endpoints)
   - [Categories](#categories-endpoints)
   - [Transactions](#transactions-endpoints)
4. [Email Notifications](#email-notifications)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Real-time Updates](#real-time-updates)
8. [Testing](#testing)
9. [Deployment](#deployment)

## API Overview

**Base URL:** `http://localhost:4000/api` (Development)  
**Production URL:** `https://api.fiscalfocus.com/api`

**Content-Type:** `application/json`  
**Authentication:** Bearer Token

### Example Base Request
```javascript
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://api.fiscalfocus.com/api' 
  : 'http://localhost:4000/api';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

## Authentication

### JWT Token
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Structure
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1516239022,
  "exp": 1516242622
}
```

## Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "date_of_birth": "1990-05-15",
  "phone_number": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "date_of_birth": "1990-05-15",
      "phone_number": "+1234567890",
      "currency": "USD",
      "monthly_income": 0,
      "savings_target": 0,
      "is_verified": false,
      "last_login": null,
      "profile_picture": null,
      "settings": {
        "notifications": true,
        "theme": "light",
        "language": "en",
        "profile_visibility": "private"
      },
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": [
    {
      "msg": "Email already registered",
      "param": "email",
      "location": "body"
    }
  ]
}
```

#### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "date_of_birth": "1990-05-15",
      "phone_number": "+1234567890",
      "currency": "USD",
      "monthly_income": 2000,
      "savings_target": 500,
      "is_verified": true,
      "last_login": "2024-01-15T11:30:00.000Z",
      "profile_picture": "/uploads/profile/user-id-12345.jpg",
      "settings": {
        "notifications": true,
        "theme": "light",
        "language": "en",
        "profile_visibility": "private"
      },
      "age": 33,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T11:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Verify Email
**GET** `/auth/verify-email/:token`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### 4. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 5. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-12345",
  "password": "newPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### 6. Get Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "date_of_birth": "1990-05-15",
      "phone_number": "+1234567890",
      "currency": "USD",
      "monthly_income": 2000,
      "savings_target": 500,
      "is_verified": true,
      "last_login": "2024-01-15T11:30:00.000Z",
      "profile_picture": "/uploads/profile/user-id-12345.jpg",
      "settings": {
        "notifications": true,
        "theme": "light",
        "language": "en",
        "profile_visibility": "private"
      },
      "age": 33,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

#### 7. Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "John Updated",
  "date_of_birth": "1990-05-15",
  "phone_number": "+1987654321",
  "monthly_income": 2500,
  "savings_target": 750,
  "settings": {
    "theme": "dark",
    "profile_visibility": "public"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Updated",
      "email": "john@example.com",
      "date_of_birth": "1990-05-15",
      "phone_number": "+1987654321",
      "currency": "USD",
      "monthly_income": 2500,
      "savings_target": 750,
      "is_verified": true,
      "last_login": "2024-01-15T11:30:00.000Z",
      "profile_picture": "/uploads/profile/user-id-12345.jpg",
      "settings": {
        "notifications": true,
        "theme": "dark",
        "language": "en",
        "profile_visibility": "public"
      },
      "age": 33,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

#### 8. Change Password
**PUT** `/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 9. Upload Profile Picture
**POST** `/auth/profile/picture`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Data:**
```
profile_picture: [file]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profile_picture": "/uploads/profile/550e8400-e29b-41d4-a716-446655440000-1705316400000.jpg"
  }
}
```

#### 10. Remove Profile Picture
**DELETE** `/auth/profile/picture`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile picture removed successfully"
}
```

### Users & Dashboard Endpoints

#### 1. Get Dashboard
**GET** `/user/dashboard`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "currentBalance": 800.00,
      "totalIncome": 2000.00,
      "totalExpenses": 1200.00,
      "todaySpending": 45.50,
      "savingsProgress": {
        "target": 500.00,
        "current": 300.00,
        "progress": 60.0,
        "remaining": 200.00,
        "is_on_track": true
      },
      "transactionCount": 25
    },
    "budget": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "month": 1,
      "year": 2024,
      "total_budget": 1500,
      "total_spent": 1200,
      "total_income": 2000,
      "savings": 300,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    },
    "recentTransactions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "amount": 45.50,
        "type": "expense",
        "description": "Grocery shopping",
        "date": "2024-01-15T10:30:00.000Z",
        "location": "Supermarket",
        "payment_method": "card",
        "Category": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "Food & Dining",
          "color": "#EF4444",
          "icon": "utensils"
        }
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440004",
        "amount": 2000,
        "type": "income",
        "description": "Monthly Salary",
        "date": "2024-01-01T00:00:00.000Z",
        "location": "Bank Transfer",
        "payment_method": "transfer",
        "Category": {
          "id": "880e8400-e29b-41d4-a716-446655440005",
          "name": "Income",
          "color": "#059669",
          "icon": "dollar-sign"
        }
      }
    ],
    "categorySpending": {
      "Food & Dining": {
        "amount": 450.00,
        "color": "#EF4444",
        "percentage": 37.5
      },
      "Transportation": {
        "amount": 180.00,
        "color": "#3B82F6",
        "percentage": 15.0
      },
      "Bills & Utilities": {
        "amount": 300.00,
        "color": "#F59E0B",
        "percentage": 25.0
      }
    },
    "alerts": [
      {
        "category": "Food & Dining",
        "spent": 450,
        "budget": 400,
        "percentage": 112,
        "threshold": 80
      }
    ]
  }
}
```

#### 2. Get Financial Summary
**GET** `/user/summary/:period`

**Parameters:**
- `period`: `day` | `week` | `month` | `year`

**Example Request:**
```
GET /user/summary/week
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "startDate": "2024-01-08T00:00:00.000Z",
    "endDate": "2024-01-14T23:59:59.999Z",
    "income": 0,
    "expenses": 320.75,
    "net": -320.75,
    "categoryBreakdown": {
      "Food & Dining": 120.50,
      "Transportation": 85.25,
      "Entertainment": 65.00,
      "Shopping": 50.00
    },
    "transactionCount": 15,
    "avgDailySpending": 45.82,
    "dailyData": [
      {
        "date": "2024-01-08",
        "amount": 42.50
      },
      {
        "date": "2024-01-09",
        "amount": 38.75
      },
      {
        "date": "2024-01-10",
        "amount": 65.25
      },
      {
        "date": "2024-01-11",
        "amount": 52.00
      },
      {
        "date": "2024-01-12",
        "amount": 45.75
      },
      {
        "date": "2024-01-13",
        "amount": 38.50
      },
      {
        "date": "2024-01-14",
        "amount": 38.00
      }
    ]
  }
}
```

### Balance Management Endpoints

#### 1. Get Current Balance
**GET** `/user/balance/balance`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "balance": 800.00,
    "totalIncome": 2000.00,
    "totalExpenses": 1200.00,
    "transactionCount": 25,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

#### 2. Get Balance Update
**GET** `/user/balance/update`

**Query Parameters:**
- `transaction_id`: (Optional) Transaction ID to calculate change

**Example Request:**
```
GET /user/balance/update?transaction_id=770e8400-e29b-41d4-a716-446655440011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_balance": 800.00,
    "previous_balance": 845.50,
    "change": -45.50,
    "today_spending": 45.50,
    "monthly_budget": 1500.00,
    "monthly_spent": 1200.00,
    "monthly_remaining": 300.00,
    "budget_utilization": 80.00,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

#### 3. Get Balance Forecast
**GET** `/user/balance/forecast`

**Query Parameters:**
- `days`: Forecast period in days (default: 30)

**Example Request:**
```
GET /user/balance/forecast?days=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "forecastPeriod": 30,
    "currentBalance": 800.00,
    "averageDaily": {
      "income": 66.67,
      "expenses": 40.00,
      "net": 26.67
    },
    "forecasted": {
      "income": 2000.00,
      "expenses": 1200.00,
      "net": 800.00
    },
    "projectedBalance": 1600.00,
    "accuracy": 95
  }
}
```

#### 4. Get Category Breakdown
**GET** `/user/balance/categories`

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Example Request:**
```
GET /user/balance/categories?start_date=2024-01-01&end_date=2024-01-15
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-15T23:59:59.999Z"
    },
    "breakdown": {
      "Food & Dining": {
        "amount": 450.00,
        "color": "#EF4444",
        "percentage": 37.5
      },
      "Transportation": {
        "amount": 180.00,
        "color": "#3B82F6",
        "percentage": 15.0
      },
      "Bills & Utilities": {
        "amount": 300.00,
        "color": "#F59E0B",
        "percentage": 25.0
      },
      "Entertainment": {
        "amount": 120.00,
        "color": "#8B5CF6",
        "percentage": 10.0
      },
      "Shopping": {
        "amount": 150.00,
        "color": "#10B981",
        "percentage": 12.5
      }
    }
  }
}
```

#### 5. Get Savings Progress
**GET** `/user/balance/savings-progress`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "target": 500.00,
    "current": 300.00,
    "progress": 60.0,
    "remaining": 200.00,
    "is_on_track": true,
    "daily_required": 0.00,
    "days_remaining": 16
  }
}
```

### Budgets Endpoints

#### 1. Create Budget
**POST** `/budgets`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "month": 1,
  "year": 2024,
  "total_budget": 1500,
  "categories": [
    {
      "category_id": "880e8400-e29b-41d4-a716-446655440003",
      "budget": 400
    },
    {
      "category_id": "880e8400-e29b-41d4-a716-446655440006",
      "budget": 350
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "budget": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "month": 1,
      "year": 2024,
      "total_budget": 1500,
      "total_spent": 0,
      "total_income": 0,
      "savings": 0,
      "is_active": true,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T12:00:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

#### 2. Get Budgets
**GET** `/budgets`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `year`: Filter by year
- `is_active`: Filter by active status

**Example Request:**
```
GET /budgets?year=2024&is_active=true&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "month": 1,
        "year": 2024,
        "total_budget": 1500,
        "total_spent": 1200,
        "total_income": 2000,
        "savings": 300,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T12:00:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440007",
        "month": 12,
        "year": 2023,
        "total_budget": 1400,
        "total_spent": 1350,
        "total_income": 1900,
        "savings": 250,
        "is_active": false,
        "created_at": "2023-12-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 3. Get Budget Overview
**GET** `/budgets/overview`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasBudget": true,
    "budget": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "month": 1,
      "year": 2024,
      "total_budget": 1500,
      "total_spent": 1200,
      "total_income": 2000,
      "savings": 300,
      "is_active": true
    },
    "totals": {
      "income": 2000,
      "expenses": 1200,
      "remaining": 300,
      "utilization": 80
    },
    "dailyAverage": 80,
    "projectedEndOfMonth": 2480
  }
}
```

#### 4. Get Single Budget
**GET** `/budgets/:id`

**Example Request:**
```
GET /budgets/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "budget": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "month": 1,
      "year": 2024,
      "total_budget": 1500,
      "total_spent": 1200,
      "total_income": 2000,
      "savings": 300,
      "is_active": true,
      "Transactions": [
        {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "amount": 45.50,
          "type": "expense",
          "description": "Grocery shopping",
          "date": "2024-01-15T10:30:00.000Z",
          "Category": {
            "id": "880e8400-e29b-41d4-a716-446655440003",
            "name": "Food & Dining",
            "color": "#EF4444"
          }
        }
      ]
    },
    "categorySpending": [
      {
        "category_id": "880e8400-e29b-41d4-a716-446655440003",
        "total_spent": 450,
        "Category": {
          "name": "Food & Dining",
          "color": "#EF4444",
          "monthly_budget": 400
        }
      }
    ]
  }
}
```

#### 5. Update Budget
**PUT** `/budgets/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "total_budget": 1600,
  "is_active": true,
  "notes": "Increased budget for groceries"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "budget": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "month": 1,
      "year": 2024,
      "total_budget": 1600,
      "total_spent": 1200,
      "total_income": 2000,
      "savings": 400,
      "is_active": true,
      "notes": "Increased budget for groceries",
      "updated_at": "2024-01-15T13:00:00.000Z"
    }
  }
}
```

#### 6. Delete Budget
**DELETE** `/budgets/:id`

**Example Request:**
```
DELETE /budgets/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

### Categories Endpoints

#### 1. Create Category
**POST** `/categories`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Entertainment",
  "description": "Movies, concerts, and leisure activities",
  "color": "#8B5CF6",
  "icon": "film",
  "monthly_budget": 100,
  "budget_threshold": 80
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "880e8400-e29b-41d4-a716-446655440008",
      "name": "Entertainment",
      "description": "Movies, concerts, and leisure activities",
      "color": "#8B5CF6",
      "icon": "film",
      "monthly_budget": 100,
      "budget_threshold": 80,
      "is_default": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T13:00:00.000Z",
      "updated_at": "2024-01-15T13:00:00.000Z"
    }
  }
}
```

#### 2. Get Categories
**GET** `/categories`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `search`: Search by name
- `has_budget`: Filter categories with/without budget

**Example Request:**
```
GET /categories?search=food&has_budget=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "Food & Dining",
        "description": "Groceries, restaurants, and takeout",
        "color": "#EF4444",
        "icon": "utensils",
        "monthly_budget": 400,
        "budget_threshold": 80,
        "is_default": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T12:00:00.000Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440006",
        "name": "Bills & Utilities",
        "description": "Monthly bills and utilities",
        "color": "#F59E0B",
        "icon": "receipt",
        "monthly_budget": 350,
        "budget_threshold": 90,
        "is_default": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-10T00:00:00.000Z"
      }
    ]
  }
}
```

#### 3. Get Category Stats
**GET** `/categories/stats/:period`

**Parameters:**
- `period`: `month` | `quarter` | `year`

**Example Request:**
```
GET /categories/stats/month
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z",
    "categories": [
      {
        "category": "Food & Dining",
        "color": "#EF4444",
        "icon": "utensils",
        "budget": 400,
        "spent": 450,
        "percentage": 112,
        "transactionCount": 12
      },
      {
        "category": "Transportation",
        "color": "#3B82F6",
        "icon": "car",
        "budget": 200,
        "spent": 180,
        "percentage": 90,
        "transactionCount": 8
      },
      {
        "category": "Entertainment",
        "color": "#8B5CF6",
        "icon": "film",
        "budget": 100,
        "spent": 65,
        "percentage": 65,
        "transactionCount": 4
      }
    ]
  }
}
```

#### 4. Get Single Category
**GET** `/categories/:id`

**Example Request:**
```
GET /categories/880e8400-e29b-41d4-a716-446655440003
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Food & Dining",
      "description": "Groceries, restaurants, and takeout",
      "color": "#EF4444",
      "icon": "utensils",
      "monthly_budget": 400,
      "budget_threshold": 80,
      "is_default": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    },
    "spending": {
      "total": 450,
      "percentage": 112,
      "transactions": [
        {
          "id": "770e8400-e29b-41d4-a716-446655440009",
          "amount": 45.50,
          "description": "Grocery shopping",
          "date": "2024-01-15T10:30:00.000Z",
          "type": "expense"
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440010",
          "amount": 25.00,
          "description": "Lunch at restaurant",
          "date": "2024-01-14T13:00:00.000Z",
          "type": "expense"
        }
      ],
      "count": 12
    }
  }
}
```

#### 5. Update Category
**PUT** `/categories/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Food & Dining (Updated)",
  "monthly_budget": 450,
  "budget_threshold": 85,
  "color": "#DC2626"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Food & Dining (Updated)",
      "monthly_budget": 450,
      "budget_threshold": 85,
      "color": "#DC2626",
      "updated_at": "2024-01-15T14:00:00.000Z"
    }
  }
}
```

#### 6. Delete Category
**DELETE** `/categories/:id`

**Example Request:**
```
DELETE /categories/880e8400-e29b-41d4-a716-446655440008
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Response (400 Bad Request - Category has transactions):**
```json
{
  "success": false,
  "message": "Cannot delete category with existing transactions. Reassign transactions first."
}
```

### Transactions Endpoints

#### 1. Create Transaction
**POST** `/transactions`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "amount": 45.50,
  "type": "expense",
  "description": "Grocery shopping at Walmart",
  "date": "2024-01-15T10:30:00.000Z",
  "category_id": "880e8400-e29b-41d4-a716-446655440003",
  "is_recurring": false,
  "location": "Walmart, 123 Main St",
  "payment_method": "credit_card",
  "notes": "Weekly grocery shopping"
}
```

**Recurring Transaction Example:**
```json
{
  "amount": 15.99,
  "type": "expense",
  "description": "Netflix Subscription",
  "date": "2024-01-15T00:00:00.000Z",
  "category_id": "880e8400-e29b-41d4-a716-446655440008",
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "payment_method": "paypal",
  "notes": "Monthly entertainment subscription"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "770e8400-e29b-41d4-a716-446655440011",
      "amount": 45.50,
      "type": "expense",
      "description": "Grocery shopping at Walmart",
      "date": "2024-01-15T10:30:00.000Z",
      "is_recurring": false,
      "recurrence_pattern": null,
      "next_occurrence": null,
      "location": "Walmart, 123 Main St",
      "payment_method": "credit_card",
      "notes": "Weekly grocery shopping",
      "is_cleared": true,
      "category_id": "880e8400-e29b-41d4-a716-446655440003",
      "budget_id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T14:30:00.000Z",
      "updated_at": "2024-01-15T14:30:00.000Z"
    },
    "balanceUpdate": {
      "current_balance": 800.00,
      "previous_balance": 845.50,
      "change": -45.50,
      "today_spending": 45.50,
      "monthly_budget": 1500.00,
      "monthly_spent": 1200.00,
      "monthly_remaining": 300.00,
      "budget_utilization": 80.00,
      "timestamp": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

#### 2. Get Transactions
**GET** `/transactions`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: `income` | `expense`
- `category_id`: Filter by category
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `search`: Search in description/notes
- `payment_method`: Filter by payment method
- `is_recurring`: Filter recurring transactions

**Example Request:**
```
GET /transactions?type=expense&startDate=2024-01-01&endDate=2024-01-15&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440011",
        "amount": 45.50,
        "type": "expense",
        "description": "Grocery shopping at Walmart",
        "date": "2024-01-15T10:30:00.000Z",
        "location": "Walmart, 123 Main St",
        "payment_method": "credit_card",
        "notes": "Weekly grocery shopping",
        "is_recurring": false,
        "is_cleared": true,
        "Category": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "Food & Dining",
          "color": "#EF4444",
          "icon": "utensils"
        }
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440012",
        "amount": 85.25,
        "type": "expense",
        "description": "Gas for car",
        "date": "2024-01-14T15:45:00.000Z",
        "location": "Shell Station",
        "payment_method": "debit_card",
        "notes": "Full tank",
        "is_recurring": false,
        "is_cleared": true,
        "Category": {
          "id": "880e8400-e29b-41d4-a716-446655440013",
          "name": "Transportation",
          "color": "#3B82F6",
          "icon": "car"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

#### 3. Get Transaction Stats
**GET** `/transactions/stats/:period`

**Parameters:**
- `period`: `week` | `month` | `year`

**Example Request:**
```
GET /transactions/stats/month
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z",
    "totals": {
      "income": 2000,
      "expenses": 1200,
      "net": 800
    },
    "averages": {
      "daily": 80,
      "weekly": 560
    },
    "topCategories": [
      {
        "name": "Food & Dining",
        "amount": 450
      },
      {
        "name": "Bills & Utilities",
        "amount": 300
      },
      {
        "name": "Transportation",
        "amount": 180
      },
      {
        "name": "Entertainment",
        "amount": 65
      },
      {
        "name": "Shopping",
        "amount": 50
      }
    ],
    "transactionCount": 25,
    "dailyData": [
      {
        "date": "2024-01-01",
        "amount": 0
      },
      {
        "date": "2024-01-02",
        "amount": 42.50
      },
      // ... daily data for the month
    ]
  }
}
```

#### 4. Get Single Transaction
**GET** `/transactions/:id`

**Example Request:**
```
GET /transactions/770e8400-e29b-41d4-a716-446655440011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "770e8400-e29b-41d4-a716-446655440011",
      "amount": 45.50,
      "type": "expense",
      "description": "Grocery shopping at Walmart",
      "date": "2024-01-15T10:30:00.000Z",
      "is_recurring": false,
      "recurrence_pattern": null,
      "next_occurrence": null,
      "location": "Walmart, 123 Main St",
      "payment_method": "credit_card",
      "notes": "Weekly grocery shopping",
      "is_cleared": true,
      "category_id": "880e8400-e29b-41d4-a716-446655440003",
      "budget_id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T14:30:00.000Z",
      "updated_at": "2024-01-15T14:30:00.000Z",
      "Category": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "Food & Dining",
        "color": "#EF4444",
        "icon": "utensils"
      },
      "Budget": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "month": 1,
        "year": 2024,
        "total_budget": 1500
      }
    }
  }
}
```

#### 5. Update Transaction
**PUT** `/transactions/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping at Walmart (Updated)",
  "category_id": "880e8400-e29b-41d4-a716-446655440003",
  "notes": "Including some extra items"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "id": "770e8400-e29b-41d4-a716-446655440011",
      "amount": 50.00,
      "description": "Grocery shopping at Walmart (Updated)",
      "notes": "Including some extra items",
      "updated_at": "2024-01-15T15:00:00.000Z"
    },
    "balanceUpdate": {
      "current_balance": 795.50,
      "previous_balance": 800.00,
      "change": -4.50,
      "today_spending": 50.00,
      "monthly_budget": 1500.00,
      "monthly_spent": 1204.50,
      "monthly_remaining": 295.50,
      "budget_utilization": 80.30,
      "timestamp": "2024-01-15T15:00:00.000Z"
    }
  }
}
```

#### 6. Delete Transaction
**DELETE** `/transactions/:id`

**Example Request:**
```
DELETE /transactions/770e8400-e29b-41d4-a716-446655440011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "balanceUpdate": {
      "current_balance": 845.50,
      "previous_balance": 800.00,
      "change": 45.50,
      "today_spending": 0,
      "monthly_budget": 1500.00,
      "monthly_spent": 1155.00,
      "monthly_remaining": 345.00,
      "budget_utilization": 77.00,
      "timestamp": "2024-01-15T15:30:00.000Z"
    }
  }
}
```

#### 7. Process Recurring Transactions
**GET** `/transactions/recurring/process`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Processed 2 recurring transactions",
  "data": {
    "transactions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440014",
        "amount": 15.99,
        "description": "Netflix Subscription",
        "date": "2024-01-15T00:00:00.000Z",
        "next_occurrence": "2024-02-15T00:00:00.000Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440015",
        "amount": 9.99,
        "description": "Spotify Subscription",
        "date": "2024-01-15T00:00:00.000Z",
        "next_occurrence": "2024-02-15T00:00:00.000Z"
      }
    ],
    "balanceUpdate": {
      "current_balance": 819.52,
      "previous_balance": 845.50,
      "change": -25.98,
      "today_spending": 25.98,
      "monthly_budget": 1500.00,
      "monthly_spent": 1180.98,
      "monthly_remaining": 319.02,
      "budget_utilization": 78.73,
      "timestamp": "2024-01-15T16:00:00.000Z"
    }
  }
}
```

## Email Notifications

### Types of Email Notifications:
1. **Welcome Email**: Sent after registration
2. **Verification Email**: Email address verification
3. **Password Reset Email**: For password recovery
4. **Budget Alert Email**: When spending reaches 80% of budget
5. **Weekly Summary Email**: Weekly financial summary

### Email Templates:
All emails use Tailwind CSS for styling and are mobile-responsive.

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "msg": "Field validation error",
      "param": "field_name",
      "location": "body"
    }
  ],
  "timestamp": "2024-01-15T14:30:00.000Z",
  "path": "/api/auth/register",
  "method": "POST"
}
```

### Common Error Codes
- **400**: Bad Request - Validation errors
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **422**: Unprocessable Entity - Business logic errors
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server-side error

### Example Error Responses

#### Validation Error (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email must be valid",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters",
      "param": "password",
      "location": "body"
    }
  ]
}
```

#### Unauthorized (401):
```json
{
  "success": false,
  "message": "Please authenticate",
  "status": "error"
}
```

#### Not Found (404):
```json
{
  "success": false,
  "message": "Transaction not found",
  "status": "error"
}
```

#### Conflict (409):
```json
{
  "success": false,
  "message": "Budget already exists for this period",
  "status": "error"
}
```

## Rate Limiting

### Limits
- **Authentication endpoints**: 10 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **File uploads**: 5 requests per 15 minutes

### Rate Limit Response (429):
```json
{
  "success": false,
  "message": "Too many requests from the IP, please try again later."
}
```

### Headers in Response
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705316400
Retry-After: 900
```

## Real-time Updates

### Polling Mechanism
Since WebSocket is not used, real-time updates are achieved through:

1. **Immediate Balance Updates**: All transaction operations return updated balance
2. **Periodic Polling**: Frontend can poll for balance updates
3. **Email Notifications**: Real-time alerts via email

### Frontend Implementation Example:
```javascript
class FiscalFocusClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.currentBalance = null;
  }

  async createTransaction(transactionData) {
    const response = await fetch(`${this.baseURL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local balance from response
      this.currentBalance = result.data.balanceUpdate.current_balance;
      return result;
    }
    
    return result;
  }

  // Poll for balance updates
  startBalancePolling(interval = 30000) {
    this.pollingInterval = setInterval(async () => {
      await this.fetchBalanceUpdate();
    }, interval);
  }

  async fetchBalanceUpdate() {
    const response = await fetch(`${this.baseURL}/user/balance/update`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && this.currentBalance !== null) {
      const newBalance = result.data.current_balance;
      
      if (this.currentBalance !== newBalance) {
        this.currentBalance = newBalance;
        this.onBalanceChange(this.currentBalance);
      }
    }
  }

  onBalanceChange(newBalance) {
    // Override this method to handle balance changes
    console.log(`Balance updated to: $${newBalance.toFixed(2)}`);
  }
}
```

## Testing

### Test Data

#### User Credentials:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Sample Transaction:
```json
{
  "amount": 29.99,
  "type": "expense",
  "description": "Test transaction",
  "category_id": "category-uuid-here",
  "date": "2024-01-15T10:30:00.000Z"
}
```

### Test Environment Variables
```env
NODE_ENV=test
TEST_DB_STORAGE=./test_database.db
JWT_SECRET=test_secret
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm run test:coverage
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=4000
SERVER_URL=https://api.fiscalfocus.com

# Database
USE_SQLite=false
DB_HOST=your-postgres-host
DB_USER=your-postgres-user
DB_PASS=your-postgres-password
DB_PORT=5432
DB_NAME=fiscalfocus_prod

# Security
JWT_SECRET=your_strong_jwt_secret_here
SALT=12

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password

# Rate Limiting
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW=15

# Frontend URLs
FRONTEND_DEV_URL=http://localhost:5173
FRONTEND_PROD_URL=https://fiscalfocus.com
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
```

### Health Check Endpoint
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "success": true,
  "timestamp": "2024-01-15T14:30:00.000Z",
  "service": "Fiscal Focus API",
  "version": "1.0.0",
  "database": "connected",
  "uptime": "2 days, 5 hours",
  "memory": {
    "heapUsed": "45.2 MB",
    "heapTotal": "85.7 MB"
  }
}
```

## Quick Start Examples

### JavaScript/Node.js
```javascript
const API_BASE = 'http://localhost:4000/api';

class FiscalFocusAPI {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getDashboard() {
    const response = await fetch(`${API_BASE}/user/dashboard`, {
      headers: this.headers
    });
    return await response.json();
  }

  async createTransaction(transaction) {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(transaction)
    });
    return await response.json();
  }

  async getBalance() {
    const response = await fetch(`${API_BASE}/user/balance/balance`, {
      headers: this.headers
    });
    return await response.json();
  }
}

// Usage
const api = new FiscalFocusAPI('your-token-here');
const dashboard = await api.getDashboard();
console.log('Current balance:', dashboard.data.overview.currentBalance);
```

### Python
```python
import requests

class FiscalFocusAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_dashboard(self):
        response = requests.get(
            f'{self.base_url}/user/dashboard',
            headers=self.headers
        )
        return response.json()
    
    def create_transaction(self, transaction):
        response = requests.post(
            f'{self.base_url}/transactions',
            json=transaction,
            headers=self.headers
        )
        return response.json()

# Usage
api = FiscalFocusAPI('http://localhost:4000/api', 'your-token-here')
dashboard = api.get_dashboard()
```

### cURL Examples

#### Register User:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "date_of_birth": "1990-05-15",
    "phone_number": "+1234567890"
  }'
```

#### Create Transaction:
```bash
curl -X POST http://localhost:4000/api/transactions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.50,
    "type": "expense",
    "description": "Grocery shopping",
    "category_id": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

#### Upload Profile Picture:
```bash
curl -X POST http://localhost:4000/api/auth/profile/picture \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "profile_picture=@/path/to/photo.jpg"
```

#### Get Balance Update:
```bash
curl -X GET http://localhost:4000/api/user/balance/update \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Support

For issues or questions:
1. Check the [API Documentation](github.com/Fawaz16/Fiscal-focus/tree/main/backend/documentation.md)
2. Contact support: support@fiscalfocus.com
3. GitHub Issues: [github.com/Fawaz16/Fiscal-focus/tree/main/backend](https://github.com/Fawaz16/Fiscal-focus/tree/main/backend)

---

**Version:** 2.0.0  
**Last Updated:** January 15, 2024  
**Status:** Active Development  
**Changes:** Added Balance Management Endpoints, Enhanced Real-time Updates