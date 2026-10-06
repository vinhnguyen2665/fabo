package dev.c9tech.fabo.pos.service;

import java.util.List;
import java.util.Map;

public interface PosMenuService {
    List<Map<String, Object>> getFullMenu(String branchId);
}
