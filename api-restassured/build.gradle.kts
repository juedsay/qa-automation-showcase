plugins {
    java
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)

    testImplementation(libs.rest.assured)
    testImplementation(libs.rest.assured.json.schema.validator)
    testImplementation(libs.jackson.databind)
    testImplementation(libs.assertj.core)
}

tasks.test {
    useJUnitPlatform()

    // Forward target overrides (e.g. -Dtoolshop.apiUrl=http://localhost:8091) to the test JVM.
    System.getProperties()
        .filterKeys { it.toString().startsWith("toolshop.") }
        .forEach { (key, value) -> systemProperty(key.toString(), value) }

    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
