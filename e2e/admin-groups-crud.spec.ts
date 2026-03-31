import { test, expect } from "@playwright/test";
import { injectSession } from "./helpers/auth";

test.describe("Admin Groups CRUD", () => {
  test("staff can create group and sees duplicate validation message", async ({ page }) => {
    await injectSession(page);

    const groups = [
      { id: "1", name: "Youth" },
      { id: "2", name: "Choir" },
    ];

    await page.route(/\/graphql\/?$/, async (route, request) => {
      const body = request.postDataJSON() as { query?: string; variables?: Record<string, unknown> };
      const query = body?.query || "";

      if (query.includes("currentUserRole")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              currentUserRole: {
                isAuthenticated: true,
                isStaff: true,
                isCategoryAdmin: false,
                isGroupAdmin: false,
                isContentAdmin: false,
                adminCategoryIds: [],
                adminGroupNames: [],
                adminCategories: [],
              },
            },
          }),
        });
        return;
      }

      if (query.includes("groupsList")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { groupsList: groups } }),
        });
        return;
      }

      if (query.includes("createGroup")) {
        const name = String(body?.variables?.name || "").trim();
        const exists = groups.some((g) => g.name.toLowerCase() === name.toLowerCase());

        if (exists) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                createGroup: {
                  success: false,
                  message: `Group '${name}' already exists`,
                  group: null,
                },
              },
            }),
          });
          return;
        }

        const created = { id: `${groups.length + 1}`, name };
        groups.push(created);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              createGroup: {
                success: true,
                message: `Group '${name}' created successfully`,
                group: created,
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    });

    await page.goto("/admin/groups", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /^groups$/i })).toBeVisible();
    await expect(page.getByText("Youth")).toBeVisible();
    await expect(page.getByText("Choir")).toBeVisible();

    await page.getByLabel(/group name/i).fill("Hospitality");
    await page.getByRole("button", { name: /create group/i }).click();

    await expect(page.getByText(/created successfully/i)).toBeVisible();
    await expect(page.locator("div.font-medium", { hasText: "Hospitality" }).first()).toBeVisible();

    await page.getByLabel(/group name/i).fill("Youth");
    await page.getByRole("button", { name: /create group/i }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("staff can bulk add members to group", async ({ page }) => {
    await injectSession(page);

    await page.route(/\/graphql\/?$/, async (route, request) => {
      const body = request.postDataJSON() as { query?: string; variables?: Record<string, unknown> };
      const query = body?.query || "";

      if (query.includes("currentUserRole")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              currentUserRole: {
                isAuthenticated: true,
                isStaff: true,
                isCategoryAdmin: false,
                isGroupAdmin: false,
                isContentAdmin: false,
                adminCategoryIds: [],
                adminGroupNames: [],
                adminCategories: [],
              },
            },
          }),
        });
        return;
      }

      if (query.includes("groupsList")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { groupsList: [{ id: "1", name: "Youth" }] },
          }),
        });
        return;
      }

      if (query.includes("membersList")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              membersList: {
                items: [
                  { id: "101", fullName: "Jane Doe", phoneNumber: "0711111111" },
                  { id: "102", fullName: "John Smith", phoneNumber: "0722222222" },
                ],
                total: 2,
                hasMore: false,
              },
            },
          }),
        });
        return;
      }

      if (query.includes("bulkAddMembersToGroup")) {
        const memberIds = body?.variables?.memberIds as string[];
        const groupId = body?.variables?.groupId;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              bulkAddMembersToGroup: {
                success: true,
                message: `Added ${memberIds.length} member(s) to group ID ${groupId}`,
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    });

    await page.goto("/admin/groups", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^groups$/i })).toBeVisible();

    // Click on Add Members for the first group (Youth)
    await page.getByRole("button", { name: /Add Members/i }).first().click();
    await expect(page.getByRole("dialog", { name: /Add Members to Youth/i })).toBeVisible();

    // Verify members are listed
    await expect(page.getByText("Jane Doe")).toBeVisible();
    await expect(page.getByText("John Smith")).toBeVisible();

    // Click Select All
    await page.getByLabel("Select All").click();

    // Click Add
    await page.getByRole("button", { name: /Add \(2\)/i }).click();

    // Verify success message
    await expect(page.getByText("Added 2 member(s) to group ID 1")).toBeVisible();
  });
});
