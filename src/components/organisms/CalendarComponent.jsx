import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { cropCycleService } from "@/services/api/planningService";
import Loading from "@/components/ui/Loading";

const CalendarComponent = ({ onDateSelect, selectedDate, onCropCycleClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cropCycles, setCropCycles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCropCycles();
  }, [currentDate]);

  const loadCropCycles = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const cycles = await cropCycleService.getByDateRange(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      setCropCycles(cycles);
    } catch (error) {
      console.error('Failed to load crop cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Generate calendar grid (42 days to fill 6 weeks)
  const calendarDays = [];
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    calendarDays.push(date);
  }

  const getCropCyclesForDate = (date) => {
    return cropCycles.filter(cycle => {
      const plantDate = new Date(cycle.plantingDate);
      const harvestDate = new Date(cycle.harvestDate);
      return (isSameDay(date, plantDate) || isSameDay(date, harvestDate));
    });
  };

  const getCropTypeColor = (cropType) => {
    const colors = {
      "Corn": "bg-yellow-500",
      "Soybeans": "bg-green-500", 
      "Wheat": "bg-orange-500",
      "Cotton": "bg-blue-500",
      "Rice": "bg-purple-500",
      "Tomatoes": "bg-red-500",
      "Potatoes": "bg-amber-600",
      "Lettuce": "bg-emerald-500",
      "Carrots": "bg-orange-600",
      "Onions": "bg-purple-600"
    };
    return colors[cropType] || "bg-gray-500";
  };

  const navigateMonth = (direction) => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ApperIcon name="Calendar" className="w-5 h-5" />
            <span>Crop Planning Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const dayCropCycles = getCropCyclesForDate(date);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors",
                  !isCurrentMonth && "bg-gray-50 text-gray-400",
                  isSelected && "bg-primary-50 border-primary-300",
                  isToday && "bg-blue-50 border-blue-300"
                )}
                onClick={() => onDateSelect && onDateSelect(date)}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mb-1",
                  isToday && "bg-blue-600 text-white",
                  isSelected && !isToday && "bg-primary-600 text-white",
                  !isSelected && !isToday && isCurrentMonth && "text-gray-900",
                  !isCurrentMonth && "text-gray-400"
                )}>
                  {format(date, 'd')}
                </div>

                {/* Crop cycle indicators */}
                <div className="space-y-1">
                  {dayCropCycles.slice(0, 3).map((cycle) => {
                    const isPlantingDate = isSameDay(date, new Date(cycle.plantingDate));
                    const isHarvestDate = isSameDay(date, new Date(cycle.harvestDate));
                    
                    return (
                      <div
                        key={cycle.Id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded text-white cursor-pointer hover:opacity-80 truncate",
                          getCropTypeColor(cycle.cropType)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCropCycleClick && onCropCycleClick(cycle);
                        }}
                        title={`${cycle.cropType} - ${cycle.fieldLocation}`}
                      >
                        <div className="flex items-center space-x-1">
                          <ApperIcon 
                            name={isPlantingDate ? "Sprout" : "Scissors"} 
                            className="w-3 h-3 flex-shrink-0" 
                          />
                          <span className="truncate">{cycle.cropType}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayCropCycles.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayCropCycles.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarComponent;