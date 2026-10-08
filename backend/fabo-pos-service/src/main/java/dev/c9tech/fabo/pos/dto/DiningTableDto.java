package dev.c9tech.fabo.pos.dto;

import dev.c9tech.fabo.pos.entity.DiningTable.TableStatus;

import java.util.Date;
import java.time.LocalDateTime;
import java.io.Serializable;

public class DiningTableDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String tableName;
    private String areaId;
    private String areaName;
    private String branchId;
    private TableStatus status;
    private Integer capacity;
    private String activeOrderId;
    private LocalDateTime lastStatusChange;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String shape;
    private Integer rotation;

    public DiningTableDto() {
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTableName() {
        return this.tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getAreaId() {
        return this.areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }

    public String getAreaName() {
        return this.areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public String getBranchId() {
        return this.branchId;
    }

    public void setBranchId(String branchId) {
        this.branchId = branchId;
    }

    public TableStatus getStatus() {
        return this.status;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public Integer getCapacity() {
        return this.capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getActiveOrderId() {
        return this.activeOrderId;
    }

    public void setActiveOrderId(String activeOrderId) {
        this.activeOrderId = activeOrderId;
    }

    public LocalDateTime getLastStatusChange() {
        return this.lastStatusChange;
    }

    public void setLastStatusChange(LocalDateTime lastStatusChange) {
        this.lastStatusChange = lastStatusChange;
    }

    public Integer getPosX() {
        return this.posX;
    }

    public void setPosX(Integer posX) {
        this.posX = posX;
    }

    public Integer getPosY() {
        return this.posY;
    }

    public void setPosY(Integer posY) {
        this.posY = posY;
    }

    public Integer getWidth() {
        return this.width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return this.height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getShape() {
        return this.shape;
    }

    public void setShape(String shape) {
        this.shape = shape;
    }

    public Integer getRotation() {
        return this.rotation;
    }

    public void setRotation(Integer rotation) {
        this.rotation = rotation;
    }

}
