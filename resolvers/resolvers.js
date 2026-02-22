const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const resolvers = {
  Query: {
    // 2) Login (Query)
    login: async (_, { username, email, password }) => {
      // user can login using username OR email + password (assignment)
      const user = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (!user) {
        throw new Error("User not found");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt?.toISOString?.() || null,
          updatedAt: user.updatedAt?.toISOString?.() || null,
        },
        message: "Login successful",
      };
    },

    // 3) Get all employees (Query)
    getAllEmployees: async () => {
      return await Employee.find().sort({ createdAt: -1 });
    },

    // 5) Search employee by eid (Query)
    getEmployeeById: async (_, { id }) => {
      const employee = await Employee.findById(id);
      if (!employee) throw new Error("Employee not found");
      return employee;
    },

    // 8) Search employee by designation OR department (Query)
    searchEmployee: async (_, { designation, department }) => {
      if (!designation && !department) {
        throw new Error("Provide designation or department");
      }

      const filter = {
        $or: [],
      };

      if (designation) filter.$or.push({ designation });
      if (department) filter.$or.push({ department });

      return await Employee.find(filter).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    // 1) Signup (Mutation)
    signup: async (_, { username, email, password }) => {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) throw new Error("Username already exists");

      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error("Email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt?.toISOString?.() || null,
          updatedAt: user.updatedAt?.toISOString?.() || null,
        },
        message: "Signup successful",
      };
    },

    // 4) Add new employee (Mutation)
    addEmployee: async (_, args) => {
      if (args.salary < 1000) throw new Error("Salary must be >= 1000");

      const existing = await Employee.findOne({ email: args.email });
      if (existing) throw new Error("Employee email already exists");

      let photoUrl = null;

if (args.employee_photo) {
  const upload = await args.employee_photo;

    const streamFactory =
        upload.createReadStream ||
        upload.file?.createReadStream ||
        upload.promise?.createReadStream;

    if (!streamFactory) {
        throw new Error("Upload failed: createReadStream not available");
    }

    const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
        { folder: "comp3133_assignment1_employees" },
        (error, result) => {
            if (error) return reject(error);
            resolve(result);
        }
        );

        streamFactory().pipe(cloudStream);
    });

    photoUrl = uploadResult.secure_url;
    }
      

      const employee = await Employee.create({
        ...args,
        employee_photo: photoUrl,
        date_of_joining: new Date(args.date_of_joining),
      });

      return employee;
    },

    // 6) Update employee by eid (Mutation)
    updateEmployee: async (_, { id, ...updates }) => {
      if (updates.salary !== undefined && updates.salary < 1000) {
        throw new Error("Salary must be >= 1000");
      }

      const employee = await Employee.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!employee) throw new Error("Employee not found");
      return employee;
    },

    // 7) Delete employee by eid (Mutation)
    deleteEmployee: async (_, { id }) => {
      const employee = await Employee.findByIdAndDelete(id);
      if (!employee) throw new Error("Employee not found");
      return "Employee deleted successfully";
    },
  },
};

module.exports = resolvers;