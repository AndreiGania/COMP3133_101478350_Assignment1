const { gql } = require("apollo-server-express");

const typeDefs = gql`

  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String
    updatedAt: String
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String
    user: User
    message: String
  }

  type Query {
    login(username: String, email: String, password: String!): AuthPayload
    getAllEmployees: [Employee]
    getEmployeeById(id: ID!): Employee
    searchEmployee(designation: String, department: String): [Employee]
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): AuthPayload

    addEmployee(
      first_name: String!
      last_name: String!
      email: String!
      gender: String
      designation: String!
      salary: Float!
      date_of_joining: String!
      department: String!
      employee_photo: String
    ): Employee

    updateEmployee(
      id: ID!
      first_name: String
      last_name: String
      designation: String
      salary: Float
      department: String
    ): Employee

    deleteEmployee(id: ID!): String
  }
`;

module.exports = typeDefs;