# Database Migrations - Travel Planner Phase 1

## Migration Strategy

We use **Liquibase** for database version control. Migrations are automatically applied on application startup.

### Migration Location
```
backend/src/main/resources/db/changelog/
```

### Master Changelog
**File**: `db/changelog/db.changelog-master.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                                       http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd">
    <include file="db/changelog/001-initial-schema.xml"/>
    <include file="db/changelog/002-add-sos-features.xml"/>
</databaseChangeLog>
```

---

## Migration 002: Add SOS Features

**File**: `db/changelog/002-add-sos-features.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                                       http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd">

    <!-- Table: offline_sos_event -->
    <changeSet id="002-001-create-offline-sos-event" author="dev">
        <createTable tableName="offline_sos_event">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="user_id" type="BIGINT">
                <constraints nullable="false" foreignKeyName="fk_offline_sos_user"
                    references="users(id)" onDelete="CASCADE"/>
            </column>
            <column name="last_offline_lat" type="DECIMAL(10,8)"/>
            <column name="last_offline_lng" type="DECIMAL(11,8)"/>
            <column name="recovery_lat" type="DECIMAL(10,8)"/>
            <column name="recovery_lng" type="DECIMAL(11,8)"/>
            <column name="offline_start" type="DATETIME">
                <constraints nullable="false"/>
            </column>
            <column name="offline_end" type="DATETIME"/>
            <column name="recovery_time" type="DATETIME"/>
            <column name="status" type="VARCHAR(50)" defaultValue="QUEUED">
                <constraints nullable="false"/>
            </column>
            <column name="device_info" type="LONGTEXT"/>
            <column name="escalated_to_police" type="BOOLEAN" defaultValue="false"/>
            <column name="police_acknowledged_at" type="DATETIME"/>
            <column name="notes" type="LONGTEXT"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
        <createIndex indexName="idx_offline_sos_user_id" tableName="offline_sos_event">
            <column name="user_id"/>
        </createIndex>
        <createIndex indexName="idx_offline_sos_created_at" tableName="offline_sos_event">
            <column name="created_at"/>
        </createIndex>
    </changeSet>

    <!-- Table: emergency_contact -->
    <changeSet id="002-002-create-emergency-contact" author="dev">
        <createTable tableName="emergency_contact">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="user_id" type="BIGINT">
                <constraints nullable="false" foreignKeyName="fk_emergency_contact_user"
                    references="users(id)" onDelete="CASCADE"/>
            </column>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="phone" type="VARCHAR(20)">
                <constraints nullable="false"/>
            </column>
            <column name="email" type="VARCHAR(255)"/>
            <column name="relationship" type="VARCHAR(100)"/>
            <column name="priority" type="VARCHAR(50)" defaultValue="SECONDARY">
                <constraints nullable="false"/>
            </column>
            <column name="is_active" type="BOOLEAN" defaultValue="true">
                <constraints nullable="false"/>
            </column>
            <column name="can_receive_sms" type="BOOLEAN" defaultValue="true"/>
            <column name="can_receive_email" type="BOOLEAN" defaultValue="true"/>
            <column name="confirmed" type="BOOLEAN" defaultValue="false">
                <constraints nullable="false"/>
            </column>
            <column name="confirmation_token" type="VARCHAR(255)"/>
            <column name="notes" type="LONGTEXT"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
        <createIndex indexName="idx_emergency_contact_user_id" tableName="emergency_contact">
            <column name="user_id"/>
        </createIndex>
        <createIndex indexName="idx_emergency_contact_priority" tableName="emergency_contact">
            <column name="priority"/>
        </createIndex>
    </changeSet>

    <!-- Table: geo_zone -->
    <changeSet id="002-003-create-geo-zone" author="dev">
        <createTable tableName="geo_zone">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="description" type="LONGTEXT"/>
            <column name="zone_type" type="VARCHAR(50)">
                <constraints nullable="false"/>
            </column>
            <column name="polygon_geojson" type="LONGTEXT"/>
            <column name="latitude" type="DECIMAL(10,8)"/>
            <column name="longitude" type="DECIMAL(11,8)"/>
            <column name="radius_km" type="DECIMAL(10,2)"/>
            <column name="risk_level" type="INT"/>
            <column name="is_active" type="BOOLEAN" defaultValue="true">
                <constraints nullable="false"/>
            </column>
            <column name="created_by_id" type="BIGINT"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>

    <!-- Table: incident_report -->
    <changeSet id="002-004-create-incident-report" author="dev">
        <createTable tableName="incident_report">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="reporter_id" type="BIGINT">
                <constraints foreignKeyName="fk_incident_reporter"
                    references="users(id)" onDelete="SET NULL"/>
            </column>
            <column name="title" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="description" type="LONGTEXT">
                <constraints nullable="false"/>
            </column>
            <column name="latitude" type="DECIMAL(10,8)">
                <constraints nullable="false"/>
            </column>
            <column name="longitude" type="DECIMAL(11,8)">
                <constraints nullable="false"/>
            </column>
            <column name="severity" type="VARCHAR(50)">
                <constraints nullable="false"/>
            </column>
            <column name="source_url" type="VARCHAR(512)"/>
            <column name="image_url" type="VARCHAR(512)"/>
            <column name="verified" type="BOOLEAN" defaultValue="false">
                <constraints nullable="false"/>
            </column>
            <column name="verification_count" type="INT" defaultValue="0"/>
            <column name="status" type="VARCHAR(50)" defaultValue="OPEN"/>
            <column name="ai_classification" type="VARCHAR(100)"/>
            <column name="ai_summary" type="LONGTEXT"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
        <createIndex indexName="idx_incident_severity" tableName="incident_report">
            <column name="severity"/>
        </createIndex>
        <createIndex indexName="idx_incident_created_at" tableName="incident_report">
            <column name="created_at"/>
        </createIndex>
    </changeSet>

    <!-- Table: user_location -->
    <changeSet id="002-005-create-user-location" author="dev">
        <createTable tableName="user_location">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="user_id" type="BIGINT">
                <constraints nullable="false" foreignKeyName="fk_user_location_user"
                    references="users(id)" onDelete="CASCADE"/>
            </column>
            <column name="latitude" type="DECIMAL(10,8)">
                <constraints nullable="false"/>
            </column>
            <column name="longitude" type="DECIMAL(11,8)">
                <constraints nullable="false"/>
            </column>
            <column name="accuracy_meters" type="FLOAT"/>
            <column name="altitude_meters" type="FLOAT"/>
            <column name="heading_degrees" type="FLOAT"/>
            <column name="speed_mps" type="FLOAT"/>
            <column name="device_id" type="VARCHAR(255)"/>
            <column name="timestamp" type="DATETIME"/>
            <column name="updated_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex indexName="idx_user_location_user_id" tableName="user_location">
            <column name="user_id"/>
        </createIndex>
        <createIndex indexName="idx_user_location_updated_at" tableName="user_location">
            <column name="updated_at"/>
        </createIndex>
    </changeSet>

    <!-- Table: activity_log -->
    <changeSet id="002-006-create-activity-log" author="dev">
        <createTable tableName="activity_log">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="user_id" type="BIGINT">
                <constraints foreignKeyName="fk_activity_log_user"
                    references="users(id)" onDelete="SET NULL"/>
            </column>
            <column name="activity_type" type="VARCHAR(100)">
                <constraints nullable="false"/>
            </column>
            <column name="description" type="LONGTEXT"/>
            <column name="reference_id" type="BIGINT"/>
            <column name="reference_type" type="VARCHAR(100)"/>
            <column name="delivery_status" type="VARCHAR(50)"/>
            <column name="retry_count" type="INT" defaultValue="0"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex indexName="idx_activity_user_id" tableName="activity_log">
            <column name="user_id"/>
        </createIndex>
        <createIndex indexName="idx_activity_type" tableName="activity_log">
            <column name="activity_type"/>
        </createIndex>
    </changeSet>

    <!-- Table: audit_log -->
    <changeSet id="002-007-create-audit-log" author="dev">
        <createTable tableName="audit_log">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="actor_id" type="BIGINT">
                <constraints foreignKeyName="fk_audit_log_actor"
                    references="users(id)" onDelete="SET NULL"/>
            </column>
            <column name="action" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="target_id" type="BIGINT"/>
            <column name="target_type" type="VARCHAR(100)"/>
            <column name="details" type="LONGTEXT"/>
            <column name="ip_address" type="VARCHAR(45)"/>
            <column name="user_agent" type="VARCHAR(512)"/>
            <column name="created_at" type="DATETIME" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex indexName="idx_audit_log_actor_id" tableName="audit_log">
            <column name="actor_id"/>
        </createIndex>
        <createIndex indexName="idx_audit_log_action" tableName="audit_log">
            <column name="action"/>
        </createIndex>
    </changeSet>

</databaseChangeLog>
```

---

## Application Properties Configuration

**File**: `backend/src/main/resources/application.properties`

```properties
# Liquibase Configuration
spring.liquibase.enabled=true
spring.liquibase.change-log=classpath:/db/changelog/db.changelog-master.xml
spring.liquibase.default-schema=public
spring.liquibase.drop-first=false
spring.liquibase.user=${DB_USER}
spring.liquibase.password=${DB_PASSWORD}
```

---

## Running Migrations

### Automatic (Default)
Migrations run automatically on application startup:
```bash
cd backend
mvnw.cmd spring-boot:run
```

### Manual Rollback (if needed)
```bash
mvnw.cmd liquibase:rollback -Dliquibase.rollbackCount=1
```

### Check Migration Status
```bash
mvnw.cmd liquibase:status
```

---

## Database Schema Diagram

```
users (existing)
  ├── offline_sos_event (many)
  ├── emergency_contact (many)
  ├── user_location (many)
  ├── activity_log (many)
  ├── audit_log (as actor)
  └── incident_report (as reporter)

geo_zone
  └── (independent admin-managed)

incident_report
  └── user (reporter - optional)
```

---

## Seed Data / Demo Setup

After migrations complete, seed demo data:

**File**: `backend/src/main/resources/db/demo-data.sql`

```sql
-- Insert demo admin user
INSERT INTO users (email, password, name, phone, role, created_at, updated_at)
VALUES ('admin@travelplanner.com', 'hashed_password', 'Admin User', '555-0001', 'ADMIN', NOW(), NOW());

-- Insert demo police user
INSERT INTO users (email, password, name, phone, role, created_at, updated_at)
VALUES ('police@travelplanner.com', 'hashed_password', 'Police Officer', '555-0002', 'POLICE', NOW(), NOW());

-- Insert demo geo zones
INSERT INTO geo_zone (name, zone_type, latitude, longitude, radius_km, is_active, created_at, updated_at)
VALUES 
  ('Downtown Safe Zone', 'GREEN', 40.7128, -74.0060, 5, true, NOW(), NOW()),
  ('Nightlife District', 'YELLOW', 40.7505, -73.9972, 3, true, NOW(), NOW()),
  ('Industrial Area', 'RED', 40.7200, -74.0100, 2, true, NOW(), NOW()),
  ('City Hospital', 'HOSPITAL', 40.7400, -73.9850, 1, true, NOW(), NOW());
```

---

## PostGIS Extension (Optional for Advanced Geospatial Queries)

If using PostgreSQL with PostGIS:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Add spatial index to geo_zone
CREATE INDEX idx_geo_zone_polygon ON geo_zone USING GIST(ST_GeomFromGeoJSON(polygon_geojson));
```

---

## Troubleshooting

### Migration Conflicts
If migrations fail:
1. Check migration order in `db.changelog-master.xml`
2. Ensure unique `id` and `author` combinations
3. Review `DATABASECHANGELOG` table for lock status:
   ```sql
   SELECT * FROM DATABASECHANGELOG;
   SELECT * FROM DATABASECHANGELOGLOCK;
   ```

### Database Connection Issues
Verify database configuration in `application.properties`:
```bash
# Test connection
psql -h localhost -p 5432 -U travel_user -d travel_db -c "SELECT 1"
```

---

**Last Updated**: 2024
**Status**: Production Ready

