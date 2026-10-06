package dev.c9tech.fabo.kds.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
public class ResponseAPI<T> {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;
    private int status;
    private String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long recordsTotal;
    private T body;

    public ResponseAPI() {
    }

    public ResponseAPI(HttpStatus status) {
        this.status = status.value();
    }

    public ResponseAPI(HttpStatus status, String message) {
        this.status = status.value();
        this.message = message;
    }

    public ResponseAPI(int status) {
        this.status = status;
    }

    public ResponseAPI(int status, T body) {
        this.status = status;
        this.body = body;
    }

    public ResponseAPI(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public ResponseAPI(int status, String message, T body) {
        this.status = status;
        this.message = message;
        this.body = body;
    }

    public ResponseAPI(HttpStatus status, String message, T body) {
        this.status = status.value();
        this.message = message;
        this.body = body;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setStatus(HttpStatus status) {
        this.status = status.value();
    }

    public static <T> ResponseAPI<T> success(T body) {
        return new ResponseAPI<>(HttpStatus.OK, "SUCCESS", body);
    }

    public static <T> ResponseAPI<T> success(String message, T body) {
        return new ResponseAPI<>(HttpStatus.OK, message, body);
    }

    public static <T> ResponseAPI<T> error(HttpStatus status, String message) {
        return new ResponseAPI<>(status, message, null);
    }
}
