-- Food Donation Management System (ShareMeal)
-- MySQL Schema and Seed Data Initialization Script

CREATE DATABASE IF NOT EXISTS ShareMealDB;
USE ShareMealDB;

-- 1. Roles Table
CREATE TABLE Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users Table
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE RESTRICT
);

-- 3. User Profiles Table
CREATE TABLE UserProfiles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    Bio TEXT NULL,
    ProfileImageUrl VARCHAR(500) NULL,
    State VARCHAR(100) NOT NULL,
    District VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Area VARCHAR(100) NOT NULL,
    Pincode VARCHAR(20) NOT NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 4. Donors Table
CREATE TABLE Donors (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    ContactNumber VARCHAR(20) NOT NULL,
    Address VARCHAR(500) NOT NULL,
    Latitude DOUBLE NOT NULL,
    Longitude DOUBLE NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 5. NGOs Table
CREATE TABLE NGOs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    OrgName VARCHAR(200) NOT NULL,
    RegistrationNumber VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(20) NOT NULL,
    Address VARCHAR(500) NOT NULL,
    Latitude DOUBLE NOT NULL,
    Longitude DOUBLE NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 6. Volunteers Table
CREATE TABLE Volunteers (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    ContactNumber VARCHAR(20) NOT NULL,
    Address VARCHAR(500) NOT NULL,
    VehicleType VARCHAR(50) NOT NULL DEFAULT 'Bike',
    IsAvailable BOOLEAN DEFAULT TRUE,
    Latitude DOUBLE NOT NULL,
    Longitude DOUBLE NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 7. Food Categories Table
CREATE TABLE FoodCategories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT NULL
);

-- 8. Food Donations Table
CREATE TABLE FoodDonations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    DonorId INT NOT NULL,
    FoodName VARCHAR(200) NOT NULL,
    CategoryId INT NOT NULL,
    Quantity VARCHAR(100) NOT NULL,
    MealsCount INT NOT NULL,
    FoodType VARCHAR(50) NOT NULL DEFAULT 'Veg', -- Veg, Non Veg
    StorageType VARCHAR(50) NOT NULL DEFAULT 'Ambient', -- Dry, Refrigerated, Frozen, Ambient
    Description TEXT NULL,
    CookingDate DATETIME NOT NULL,
    ExpiryTime DATETIME NOT NULL,
    PickupTime DATETIME NOT NULL,
    PickupAddress VARCHAR(500) NOT NULL,
    ContactNumber VARCHAR(20) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Assigned, Picked Up, Delivered, Completed, Rejected, Cancelled
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DonorId) REFERENCES Donors(Id) ON DELETE CASCADE,
    FOREIGN KEY (CategoryId) REFERENCES FoodCategories(Id) ON DELETE RESTRICT
);

-- 9. Donation Images Table
CREATE TABLE DonationImages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FoodDonationId INT NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    FOREIGN KEY (FoodDonationId) REFERENCES FoodDonations(Id) ON DELETE CASCADE
);

-- 10. Donation Requests Table
CREATE TABLE DonationRequests (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FoodDonationId INT NOT NULL,
    NGOId INT NOT NULL,
    RequestStatus VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
    Message TEXT NULL,
    RequestDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FoodDonationId) REFERENCES FoodDonations(Id) ON DELETE CASCADE,
    FOREIGN KEY (NGOId) REFERENCES NGOs(Id) ON DELETE CASCADE
);

-- 11. Deliveries Table
CREATE TABLE Deliveries (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    DonationRequestId INT NOT NULL,
    VolunteerId INT NULL,
    DeliveryStatus VARCHAR(50) NOT NULL DEFAULT 'Assigned', -- Assigned, Accepted, On the Way, Picked Up, Delivered, Completed
    AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PickedUpAt DATETIME NULL,
    DeliveredAt DATETIME NULL,
    PickupRouteUrl VARCHAR(500) NULL,
    DeliveryRouteUrl VARCHAR(500) NULL,
    EstimatedTime VARCHAR(50) NULL,
    FOREIGN KEY (DonationRequestId) REFERENCES DonationRequests(Id) ON DELETE CASCADE,
    FOREIGN KEY (VolunteerId) REFERENCES Volunteers(Id) ON DELETE SET NULL
);

-- 12. Notifications Table
CREATE TABLE Notifications (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 13. Feedback Table
CREATE TABLE Feedback (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Comments TEXT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 14. Locations Table
CREATE TABLE Locations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    State VARCHAR(100) NOT NULL,
    District VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Area VARCHAR(100) NOT NULL,
    Pincode VARCHAR(20) NOT NULL,
    Latitude DOUBLE NOT NULL,
    Longitude DOUBLE NOT NULL
);

-- 15. Audit Logs Table
CREATE TABLE AuditLogs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NULL,
    Action VARCHAR(100) NOT NULL,
    Details TEXT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
);

-- 16. Reports Table
CREATE TABLE Reports (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Format VARCHAR(50) NOT NULL,
    GeneratedById INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FilePath VARCHAR(500) NOT NULL,
    FOREIGN KEY (GeneratedById) REFERENCES Users(Id) ON DELETE RESTRICT
);

-- Indexing for Performance
CREATE INDEX idx_users_role ON Users(RoleId);
CREATE INDEX idx_donations_status ON FoodDonations(Status);
CREATE INDEX idx_requests_status ON DonationRequests(RequestStatus);
CREATE INDEX idx_deliveries_status ON Deliveries(DeliveryStatus);

-- ==========================================
-- Seed Initial Metadata and Default Config
-- ==========================================

-- 1. Roles
INSERT INTO Roles (Id, Name) VALUES 
(1, 'Admin'), 
(2, 'Donor'), 
(3, 'NGO'), 
(4, 'Volunteer');

-- 2. Food Categories
INSERT INTO FoodCategories (Id, Name, Description) VALUES
(1, 'Rice', 'Rice grains, biryani, cooked rice dishes'),
(2, 'Fruits', 'Fresh fruits and fruit bowls'),
(3, 'Vegetables', 'Raw or cooked vegetable items'),
(4, 'Bakery', 'Breads, cakes, buns, and pastries'),
(5, 'Dairy', 'Milk, cheese, butter, paneer, and curd'),
(6, 'Meat', 'Chicken, mutton, fish, and other non-veg items'),
(7, 'Drinks', 'Fruit juices, water, milkshakes, and soft drinks'),
(8, 'Packed Food', 'Biscuits, chips, ready-to-eat packets, and canned food');

-- 3. Default Administrator
-- Password is 'admin123' (pre-hashed using SHA-256: 240BE518FABD2724DDB6F04EEB1DA5967448D7E831C08C8FA822809F74C720A9)
INSERT INTO Users (Id, Username, Email, PasswordHash, RoleId, IsActive) VALUES
(1, 'admin', 'admin@fooddonation.com', '240BE518FABD2724DDB6F04EEB1DA5967448D7E831C08C8FA822809F74C720A9', 1, TRUE);

-- 4. Default Administrator Profile
INSERT INTO UserProfiles (UserId, Bio, State, District, City, Area, Pincode) VALUES
(1, 'System Administrator for Food Donation Management System', 'Delhi', 'New Delhi', 'Delhi', 'Central Admin', '110001');
