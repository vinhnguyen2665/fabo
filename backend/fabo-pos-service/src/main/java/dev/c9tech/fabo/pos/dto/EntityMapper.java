package dev.c9tech.fabo.pos.dto;

import java.util.List;

import dev.c9tech.fabo.pos.entity.DiningTable;
import dev.c9tech.fabo.pos.dto.DiningTableDto;

import java.util.ArrayList;

public class EntityMapper {

    public static DiningTableDto convertDiningTableToDiningTableDto(DiningTable diningTable) {
        if (null == diningTable) {
            return null;
        }
        DiningTableDto diningTableDto = new DiningTableDto();
        if (null != diningTable.getId()) {
            diningTableDto.setId(diningTable.getId());
        }
        if (null != diningTable.getTableName()) {
            diningTableDto.setTableName(diningTable.getTableName());
        }
        if (null != diningTable.getAreaId()) {
            diningTableDto.setAreaId(diningTable.getAreaId());
        }
        if (null != diningTable.getAreaName()) {
            diningTableDto.setAreaName(diningTable.getAreaName());
        }
        if (null != diningTable.getBranchId()) {
            diningTableDto.setBranchId(diningTable.getBranchId());
        }
        if (null != diningTable.getStatus()) {
            diningTableDto.setStatus(diningTable.getStatus());
        }
        if (null != diningTable.getCapacity()) {
            diningTableDto.setCapacity(diningTable.getCapacity());
        }
        if (null != diningTable.getActiveOrderId()) {
            diningTableDto.setActiveOrderId(diningTable.getActiveOrderId());
        }
        if (null != diningTable.getLastStatusChange()) {
            diningTableDto.setLastStatusChange(diningTable.getLastStatusChange());
        }
        if (null != diningTable.getPosX()) {
            diningTableDto.setPosX(diningTable.getPosX());
        }
        if (null != diningTable.getPosY()) {
            diningTableDto.setPosY(diningTable.getPosY());
        }
        if (null != diningTable.getWidth()) {
            diningTableDto.setWidth(diningTable.getWidth());
        }
        if (null != diningTable.getHeight()) {
            diningTableDto.setHeight(diningTable.getHeight());
        }
        if (null != diningTable.getShape()) {
            diningTableDto.setShape(diningTable.getShape());
        }
        if (null != diningTable.getRotation()) {
            diningTableDto.setRotation(diningTable.getRotation());
        }
        return diningTableDto;
    }

    public static List<DiningTableDto> convertDiningTableToDiningTableDto(List<DiningTable> diningTableLst) {
        if (null == diningTableLst) {
            return null;
        }
        List<DiningTableDto> diningTableDtoLst = new ArrayList<>();
        for (DiningTable item : diningTableLst) {
            diningTableDtoLst.add(convertDiningTableToDiningTableDto(item));
        }
        return diningTableDtoLst;
    }

    public static DiningTable convertDiningTableDtoToDiningTable(DiningTableDto diningTableDto) {
        if (null == diningTableDto) {
            return null;
        }
        DiningTable diningTable = new DiningTable();
        if (null != diningTableDto.getId()) {
            diningTable.setId(diningTableDto.getId());
        }
        if (null != diningTableDto.getTableName()) {
            diningTable.setTableName(diningTableDto.getTableName());
        }
        if (null != diningTableDto.getAreaId()) {
            diningTable.setAreaId(diningTableDto.getAreaId());
        }
        if (null != diningTableDto.getAreaName()) {
            diningTable.setAreaName(diningTableDto.getAreaName());
        }
        if (null != diningTableDto.getBranchId()) {
            diningTable.setBranchId(diningTableDto.getBranchId());
        }
        if (null != diningTableDto.getStatus()) {
            diningTable.setStatus(diningTableDto.getStatus());
        }
        if (null != diningTableDto.getCapacity()) {
            diningTable.setCapacity(diningTableDto.getCapacity());
        }
        if (null != diningTableDto.getActiveOrderId()) {
            diningTable.setActiveOrderId(diningTableDto.getActiveOrderId());
        }
        if (null != diningTableDto.getLastStatusChange()) {
            diningTable.setLastStatusChange(diningTableDto.getLastStatusChange());
        }
        if (null != diningTableDto.getPosX()) {
            diningTable.setPosX(diningTableDto.getPosX());
        }
        if (null != diningTableDto.getPosY()) {
            diningTable.setPosY(diningTableDto.getPosY());
        }
        if (null != diningTableDto.getWidth()) {
            diningTable.setWidth(diningTableDto.getWidth());
        }
        if (null != diningTableDto.getHeight()) {
            diningTable.setHeight(diningTableDto.getHeight());
        }
        if (null != diningTableDto.getShape()) {
            diningTable.setShape(diningTableDto.getShape());
        }
        if (null != diningTableDto.getRotation()) {
            diningTable.setRotation(diningTableDto.getRotation());
        }
        return diningTable;
    }

    public static List<DiningTable> convertDiningTableDtoToDiningTable(List<DiningTableDto> diningTableDtoLst) {
        if (null == diningTableDtoLst) {
            return null;
        }
        List<DiningTable> diningTableLst = new ArrayList<>();
        for (DiningTableDto item : diningTableDtoLst) {
            diningTableLst.add(convertDiningTableDtoToDiningTable(item));
        }
        return diningTableLst;
    }

    public static DiningTable mergeDiningTable(DiningTableDto src, DiningTable des) {
        if (null == src || null == des) {
            return null;
        }
        if (null != src.getId()) {
            des.setId(src.getId());
        }
        if (null != src.getTableName()) {
            des.setTableName(src.getTableName());
        }
        if (null != src.getAreaId()) {
            des.setAreaId(src.getAreaId());
        }
        if (null != src.getAreaName()) {
            des.setAreaName(src.getAreaName());
        }
        if (null != src.getBranchId()) {
            des.setBranchId(src.getBranchId());
        }
        if (null != src.getStatus()) {
            des.setStatus(src.getStatus());
        }
        if (null != src.getCapacity()) {
            des.setCapacity(src.getCapacity());
        }
        if (null != src.getActiveOrderId()) {
            des.setActiveOrderId(src.getActiveOrderId());
        }
        if (null != src.getLastStatusChange()) {
            des.setLastStatusChange(src.getLastStatusChange());
        }
        if (null != src.getPosX()) {
            des.setPosX(src.getPosX());
        }
        if (null != src.getPosY()) {
            des.setPosY(src.getPosY());
        }
        if (null != src.getWidth()) {
            des.setWidth(src.getWidth());
        }
        if (null != src.getHeight()) {
            des.setHeight(src.getHeight());
        }
        if (null != src.getShape()) {
            des.setShape(src.getShape());
        }
        if (null != src.getRotation()) {
            des.setRotation(src.getRotation());
        }
        return des;
    }

}
