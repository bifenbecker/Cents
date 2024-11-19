SELECT u1.id as "userId", lb1.id as "businessId", r1."userType" as "role"
	FROM "users" u1
	LEFT JOIN "teamMembers" t1 ON t1."userId" = u1.id
	LEFT JOIN "userRoles" ur1 ON ur1."userId" = u1.id
	LEFT JOIN "laundromatBusiness" lb1 ON lb1."userId" = u1.id
	LEFT JOIN "roles" r1 ON r1.id = ur1."roleId"
	WHERE (ur1."roleId" = 2 AND t1."userId" IS NULL AND lb1.id IS NOT NULL);