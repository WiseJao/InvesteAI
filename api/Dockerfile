# ==================================
# STAGE 1: BUILD
# ==================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /backend

COPY pom.xml .

#RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests


# ==================================
# STAGE 2: RUNTIME
# ==================================
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /backend

COPY --from=build /backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]