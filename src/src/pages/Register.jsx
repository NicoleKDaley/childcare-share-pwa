function Register() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Register</h1>
      <form>
        <div>
          <label>Name: </label>
          <input type="text" placeholder="Enter name" />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" placeholder="Enter email" />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" placeholder="Create password" />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
