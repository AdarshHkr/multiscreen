# Stage 1: Builder
# This stage installs dependencies and builds the production application.
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client based on your schema.
# This is a crucial step to ensure your application can talk to the database.
RUN npx prisma generate

# Build the Next.js application for production.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---

# Stage 2: Runner
# This stage creates the final, minimal image for production.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for better security.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output, static assets, and the entrypoint script
# from the 'builder' stage. This leverages Next.js's standalone output feature.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

# CRITICAL FIX: Copy the prisma folder into the final image.
# This is required for the migration command in entrypoint.sh to work.
COPY --from=builder /app/prisma ./prisma

# Switch to the non-root user.
USER nextjs

EXPOSE 3000

ENV PORT=3000

# Set the entrypoint to our new script, which will run migrations
# before starting the app.
ENTRYPOINT ["./entrypoint.sh"]

# The command to start the application, which is passed to the entrypoint.
CMD ["node", "server.js"]