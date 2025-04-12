import { useState } from "react";
import { City, cities } from "@shared/schema";
import { useResourceStore } from "@/hooks/use-resource-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapIcon } from "lucide-react";

export default function CitySelector() {
  const { selectedCity, setSelectedCity } = useResourceStore();
  
  // Find index of the selected city for default value
  const defaultCityIndex = cities.findIndex(
    (city) => city.name === selectedCity.name && city.state === selectedCity.state
  );
  
  const handleCityChange = (value: string) => {
    const index = parseInt(value, 10);
    if (!isNaN(index) && index >= 0 && index < cities.length) {
      setSelectedCity(cities[index]);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-5 w-5 text-primary" />
          <CardTitle>City Selection</CardTitle>
        </div>
        <CardDescription>
          Choose a city to manage resources in that area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          defaultValue={defaultCityIndex.toString()} 
          onValueChange={handleCityChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {/* Group cities by state */}
            <SelectItem disabled value="al-header">Alabama</SelectItem>
            {cities.filter(city => city.state === "AL").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="fl-header">Florida</SelectItem>
            {cities.filter(city => city.state === "FL").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="ga-header">Georgia</SelectItem>
            {cities.filter(city => city.state === "GA").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="ms-header">Mississippi</SelectItem>
            {cities.filter(city => city.state === "MS").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="nc-header">North Carolina</SelectItem>
            {cities.filter(city => city.state === "NC").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="sc-header">South Carolina</SelectItem>
            {cities.filter(city => city.state === "SC").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
            
            <SelectItem disabled value="tn-header">Tennessee</SelectItem>
            {cities.filter(city => city.state === "TN").map((city, index) => {
              const globalIndex = cities.findIndex(c => c.name === city.name && c.state === city.state);
              return (
                <SelectItem key={`${city.name}-${city.state}`} value={globalIndex.toString()}>
                  {city.name}, {city.state}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}