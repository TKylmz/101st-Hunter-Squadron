-- 101st Hunter Squadron - DCS Status Export Hook
-- Automatically exports server data to status.json
-- Place in: Saved Games\DCS.xxx\Scripts\Hooks\

local statusFile = nil
local updateInterval = 10
local lastUpdate = 0

local function toJSON(data)
    local result = "{"
    local first = true
    
    for key, value in pairs(data) do
        if not first then result = result .. "," end
        first = false
        
        result = result .. '"' .. tostring(key) .. '":'
        
        if type(value) == "string" then
            result = result .. '"' .. value .. '"'
        elseif type(value) == "number" then
            result = result .. tostring(value)
        elseif type(value) == "boolean" then
            result = result .. (value and "true" or "false")
        elseif type(value) == "table" then
            result = result .. "["
            local arrFirst = true
            for i = 1, #value do
                if not arrFirst then result = result .. "," end
                arrFirst = false
                result = result .. '"' .. tostring(value[i]) .. '"'
            end
            result = result .. "]"
        end
    end
    
    result = result .. "}"
    return result
end

local function getPlayerList()
    local players = {}
    local playerCount = 0
    
    local plist = net.get_player_list()
    if plist then
        for i = 1, #plist do
            local pid = plist[i]
            local info = net.get_player_info(pid)
            if info and pid ~= 1 then
                table.insert(players, info.name or "Unknown")
                playerCount = playerCount + 1
            end
        end
    end
    
    return players, playerCount
end

local function exportStatus()
    local lfs = require("lfs")
    local writeDir = lfs.writedir()
    statusFile = writeDir .. "status.json"
    
    local players, playerCount = getPlayerList()
    
    local missionName = DCS.getMissionName() or "No Mission"
    local theatre = "Unknown"
    local mission = DCS.getCurrentMission()
    if mission and mission.mission and mission.mission.theatre then
        theatre = mission.mission.theatre
    end
    
    local modelTime = DCS.getModelTime() or 0
    local hours = math.floor(modelTime / 3600)
    local minutes = math.floor((modelTime % 3600) / 60)
    local missionTime = string.format("%02d:%02d", hours, minutes)
    
    local status = {
        online = true,
        serverName = "101st Hunter Squadron",
        mission = missionName,
        map = theatre,
        players = playerCount,
        maxPlayers = 32,
        missionTime = missionTime,
        playerList = players
    }
    
    local file = io.open(statusFile, "w")
    if file then
        file:write(toJSON(status))
        file:close()
        net.log("101st Status: Exported to " .. statusFile)
    else
        net.log("101st Status: Failed to write file")
    end
end

local StatusExport = {}

function StatusExport.onSimulationFrame()
    local now = DCS.getModelTime() or 0
    if now - lastUpdate >= updateInterval then
        lastUpdate = now
        local success, err = pcall(exportStatus)
        if not success then
            net.log("101st Status Error: " .. tostring(err))
        end
    end
end

function StatusExport.onMissionLoadEnd()
    local success, err = pcall(exportStatus)
    if not success then
        net.log("101st Status Error on load: " .. tostring(err))
    end
end

function StatusExport.onPlayerConnect(id)
    pcall(exportStatus)
end

function StatusExport.onPlayerDisconnect(id)
    pcall(exportStatus)
end

DCS.setUserCallbacks(StatusExport)
net.log("101st Hunter Squadron Status Export - LOADED")
