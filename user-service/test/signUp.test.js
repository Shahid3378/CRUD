const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const express = require("express");

const controllerPath = require.resolve("../src/controller/userController");
const authMiddlewarePath = require.resolve("../src/middleware/authMiddleware");
const routePath = require.resolve("../src/routes/userRoute");
const originalControllerModule = require.cache[controllerPath];
const originalAuthMiddlewareModule = require.cache[authMiddlewarePath];

require.cache[controllerPath] = {
  id: controllerPath,
  filename: controllerPath,
  loaded: true,
  exports: {
    ...Object.fromEntries(
      [
        "signUp",
        "verifyOtp",
        "login",
        "addBalance",
        "createUser",
        "getChildUsers",
        "userTempDetails",
        "usersData",
        "deleteUser",
      ].map((handlerName) => [
        handlerName,
        (req, res) => res.status(200).json({ success: true, data: req.value }),
      ]),
    ),
  },
};

require.cache[authMiddlewarePath] = {
  id: authMiddlewarePath,
  filename: authMiddlewarePath,
  loaded: true,
  exports: { authMiddleware: (_req, _res, next) => next() },
};

const userRoutes = require("../src/routes/userRoute");

delete require.cache[routePath];
if (originalControllerModule) {
  require.cache[controllerPath] = originalControllerModule;
} else {
  delete require.cache[controllerPath];
}
if (originalAuthMiddlewareModule) {
  require.cache[authMiddlewarePath] = originalAuthMiddlewareModule;
} else {
  delete require.cache[authMiddlewarePath];
}

const app = express();
app.use(express.json());
app.use("/", userRoutes);
app.use((err, _req, res, _next) => {
  res.status(400).json({ success: false, message: err.message });
});

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function postSignUp(body) {
  return fetch(`${baseUrl}/signUp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validUser = {
  name: "Sam Taylor",
  username: "sam_taylor",
  email: "sam@example.com",
  password: "SecurePass123",
  number: "1234567890",
};

test("accepts a valid signup request", async () => {
  const response = await postSignUp([validUser]);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: [validUser],
  });
});

test("rejects a signup body that is not an array", async () => {
  const response = await postSignUp(validUser);

  assert.equal(response.status, 400);
});

for (const field of ["name", "username", "email", "password", "number"]) {
  test(`rejects signup when ${field} is missing`, async () => {
    const user = { ...validUser };
    delete user[field];

    const response = await postSignUp([user]);

    assert.equal(response.status, 400);
  });
}

for (const [field, value] of [
  ["name", "Al"],
  ["name", "A".repeat(21)],
  ["username", "ab"],
  ["username", "u".repeat(26)],
  ["password", "short"],
  ["password", "p".repeat(21)],
  ["number", "   "],
]) {
  test(`rejects invalid ${field}`, async () => {
    const response = await postSignUp([{ ...validUser, [field]: value }]);

    assert.equal(response.status, 400);
  });
}
