FROM openjdk:17
ARG JAR_FILE=./build/libs/*.jar
COPY ${JAR_FILE} prestabanco.jar
ENTRYPOINT ["java","-jar","/prestabanco.jar"]