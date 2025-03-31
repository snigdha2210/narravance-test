import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Paper } from "@mui/material";
import { formatDateToEST } from "../utils/dateUtils.ts";

interface D3ChartData {
  [key: string]: string | number | undefined;
  date?: string;
  category?: string;
  value?: number;
  source_a?: number;
  source_b?: number;
}

interface D3ChartProps {
  data: D3ChartData[];
  title: string;
  type: "bar" | "line" | "area" | "pie";
  xKey: string;
  yKey: string | string[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  dateRange?: { start: Date; end: Date };
}

const DEFAULT_DATE_RANGE = {
  start: new Date("2015-01-01"),
  end: new Date("2025-03-31"),
};

const parseDate = (dateStr: string): Date => {
  const parsed = d3.timeParse("%Y-%m-%d")(dateStr);
  return parsed || new Date();
};

const D3Chart = React.forwardRef<HTMLDivElement, D3ChartProps>(
  (
    {
      data,
      title,
      type,
      xKey,
      yKey,
      width = 1000,
      height = 500,
      margin = { top: 40, right: 120, bottom: 100, left: 100 },
      dateRange = DEFAULT_DATE_RANGE,
    },
    ref,
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!data.length || !svgRef.current) return;

      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();

      // Create tooltip
      const tooltip = d3
        .select(tooltipRef.current)
        .style("position", "fixed")
        .style("visibility", "hidden")
        .style("background-color", "rgba(255, 255, 255, 0.95)")
        .style("border", "1px solid #ddd")
        .style("border-radius", "6px")
        .style("padding", "12px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)")
        .style("z-index", "9999")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("min-width", "200px");

      const svg = d3.select(svgRef.current);
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create chart group
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (type === "pie") {
        // Create pie chart with better positioning
        const radius = Math.min(innerWidth, innerHeight) / 1.5;
        const pieG = g
          .append("g")
          .attr(
            "transform",
            `translate(${innerWidth / 2}, ${innerHeight / 2})`,
          );

        const pie = d3
          .pie<D3ChartData>()
          .value((d) => d.value || 0)
          .sort(null);

        const arc = d3
          .arc<d3.PieArcDatum<D3ChartData>>()
          .innerRadius(0)
          .outerRadius(radius * 0.8);

        const labelArc = d3
          .arc<d3.PieArcDatum<D3ChartData>>()
          .innerRadius(radius * 0.6)
          .outerRadius(radius * 0.6);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pieData = pie(data);

        // Add pie segments with hover effects
        pieG
          .selectAll("path")
          .data(pieData)
          .enter()
          .append("path")
          .attr("d", arc)
          .attr("fill", (_, i) => color(i.toString()))
          .attr("stroke", "white")
          .style("stroke-width", "2px")
          .style("opacity", 0.8)
          .on("mouseover", function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .attr("transform", "scale(1.05)");

            const total = pieData.reduce(
              (sum, slice) => sum + (slice.value || 0),
              0,
            );
            const percentage = (((d.value || 0) / total) * 100).toFixed(1);

            tooltip
              .style("visibility", "visible")
              .style("top", `${event.clientY - 10}px`)
              .style("left", `${event.clientX + 10}px`).html(`
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">${
                    d.data[xKey]
                  }</div>
                  <div style="margin-bottom: 4px;">Amount: <strong>$${d.value?.toFixed(
                    2,
                  )}</strong></div>
                  <div>Percentage: <strong>${percentage}%</strong></div>
                </div>
              `);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", `${event.clientY - 10}px`)
              .style("left", `${event.clientX + 10}px`);
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 0.8)
              .attr("transform", "scale(1)");
            tooltip.style("visibility", "hidden");
          });

        // Add labels with better positioning
        pieG
          .selectAll("text")
          .data(pieData)
          .enter()
          .append("text")
          .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
          .attr("dy", "0.35em")
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#333")
          .text((d) => {
            const value = d.value;
            return typeof value === "number"
              ? value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value.toString()
              : "";
          });
      } else {
        const yKeys = Array.isArray(yKey) ? yKey : [yKey];
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Create scales
        const xScale =
          type === "bar" && !data[0]?.date
            ? d3
                .scaleBand()
                .domain(data.map((d) => String(d[xKey])))
                .range([0, innerWidth])
                .padding(0.2)
            : d3
                .scaleTime()
                .domain([dateRange.start, dateRange.end])
                .range([0, innerWidth]);

        const yScale = d3
          .scaleLinear()
          .domain([
            0,
            d3.max(data, (d) =>
              Math.max(...yKeys.map((key) => Number(d[key]) || 0)),
            ) || 0,
          ])
          .range([innerHeight, 0])
          .nice();

        // Add grid lines
        g.append("g")
          .attr("class", "grid")
          .call(
            d3
              .axisLeft(yScale)
              .ticks(10)
              .tickSize(-innerWidth)
              .tickFormat(() => ""),
          )
          .style("stroke-dasharray", "3,3")
          .style("opacity", 0.2)
          .select(".domain")
          .remove();

        // Update the x-axis creation with proper type handling
        if (type === "bar") {
          // Handle bar chart x-axis
          if (!data[0]?.date) {
            const bandScale = xScale as d3.ScaleBand<string>;
            const barXAxis = d3.axisBottom(bandScale);

            g.selectAll(".x-axis").remove();
            g.append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${innerHeight})`)
              .call(barXAxis)
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-45)");
          } else {
            // Handle time-based bar chart x-axis
            const timeScale = xScale as d3.ScaleTime<number, number>;
            const dateFormatter = d3.timeFormat("%b %d, %Y");
            const timeXAxis = d3
              .axisBottom(timeScale)
              .ticks(4)
              .tickFormat((d) => dateFormatter(d as Date));

            g.selectAll(".x-axis").remove();
            g.append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${innerHeight})`)
              .call(timeXAxis)
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-45)");
          }
        } else {
          // Handle time-based x-axis
          const timeScale = xScale as d3.ScaleTime<number, number>;
          const dateFormatter = d3.timeFormat("%b %d, %Y");
          const timeXAxis = d3
            .axisBottom(timeScale)
            .ticks(4)
            .tickFormat((d) => dateFormatter(d as Date));

          g.selectAll(".x-axis").remove();
          g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(timeXAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
        }

        // Add y-axis with more space for labels
        g.append("g")
          .call(
            d3.axisLeft(yScale).tickFormat((d) => {
              const value = Number(d);
              return value >= 1000
                ? d3.format(",.0f")(value)
                : d3.format(".0f")(value);
            }),
          )
          .selectAll("text")
          .style("font-size", "12px")
          .attr("dx", "-0.5em");

        // Add y-axis label with adjusted position
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -innerHeight / 2)
          .attr("y", -margin.left + 45)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .text("Sales ($)");

        if (type === "bar") {
          const barWidth = 10; // Fixed bar width for time-based bars

          yKeys.forEach((key, index) => {
            g.selectAll(`rect.${key}`)
              .data(data)
              .enter()
              .append("rect")
              .attr("class", key)
              .attr("x", (d) => {
                if (!d.date) {
                  const xBandScale = xScale as d3.ScaleBand<string>;
                  const xPos = xBandScale(String(d[xKey]));
                  return (
                    (xPos || 0) +
                    (xBandScale.bandwidth() / yKeys.length) * index
                  );
                } else {
                  const timeScale = xScale as d3.ScaleTime<number, number>;
                  return (
                    timeScale(parseDate(d[xKey] as string)) -
                    (barWidth * yKeys.length) / 2 +
                    barWidth * index
                  );
                }
              })
              .attr("y", (d) => yScale(Number(d[key]) || 0))
              .attr(
                "width",
                !data[0]?.date
                  ? ((xScale as d3.ScaleBand<string>).bandwidth() /
                      yKeys.length) *
                      0.9
                  : barWidth * 0.9,
              )
              .attr("height", (d) => innerHeight - yScale(Number(d[key]) || 0))
              .attr("fill", color(index.toString()))
              .attr("opacity", 0.8)
              .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("opacity", 1);

                const sourceLabel = key === "source_a" ? "Shopify" : "Etsy";
                const dateStr = d.date
                  ? formatDateToEST(parseDate(d[xKey] as string))
                  : d[xKey];

                tooltip
                  .style("visibility", "visible")
                  .style("top", `${event.clientY - 10}px`)
                  .style("left", `${event.clientX + 10}px`).html(`
                    <div style="padding: 8px;">
                      <div style="font-weight: bold; margin-bottom: 8px; color: #333;">${dateStr}</div>
                      <div style="margin-bottom: 4px;">${sourceLabel}</div>
                      <div style="margin-bottom: 4px;">Sales: <strong>$${(
                        Number(d[key]) || 0
                      ).toFixed(2)}</strong></div>
                      ${
                        d.order_count
                          ? `<div>Orders: <strong>${d.order_count}</strong></div>`
                          : ""
                      }
                    </div>
                  `);
              })
              .on("mousemove", (event) => {
                tooltip
                  .style("top", `${event.clientY - 10}px`)
                  .style("left", `${event.clientX + 10}px`);
              })
              .on("mouseout", function () {
                d3.select(this).transition().duration(200).attr("opacity", 0.8);
                tooltip.style("visibility", "hidden");
              });
          });
        } else {
          // Line and Area charts
          yKeys.forEach((key, index) => {
            const line = d3
              .line<D3ChartData>()
              .x((d) =>
                (xScale as d3.ScaleTime<number, number>)(
                  parseDate(d[xKey] as string),
                ),
              )
              .y((d) => yScale(Number(d[key]) || 0))
              .curve(d3.curveMonotoneX);

            if (type === "area") {
              const area = d3
                .area<D3ChartData>()
                .x((d) =>
                  (xScale as d3.ScaleTime<number, number>)(
                    parseDate(d[xKey] as string),
                  ),
                )
                .y0(innerHeight)
                .y1((d) => yScale(Number(d[key]) || 0))
                .curve(d3.curveMonotoneX);

              // Add area
              g.append("path")
                .datum(data)
                .attr("fill", color(index.toString()))
                .attr("fill-opacity", 0.2)
                .attr("d", area);
            }

            // Add line
            g.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", color(index.toString()))
              .attr("stroke-width", 2)
              .attr("d", line);

            // Add dots for interaction
            g.selectAll(`circle.${key}`)
              .data(data)
              .enter()
              .append("circle")
              .attr("class", key)
              .attr("cx", (d) =>
                (xScale as d3.ScaleTime<number, number>)(
                  parseDate(d[xKey] as string),
                ),
              )
              .attr("cy", (d) => yScale(Number(d[key]) || 0))
              .attr("r", type === "line" ? 4 : 0)
              .attr("fill", color(index.toString()))
              .attr("stroke", "white")
              .attr("stroke-width", 2)
              .style("opacity", type === "line" ? 0.8 : 0)
              .on("mouseover", function (event, d) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("r", 6)
                  .style("opacity", 1);

                const sourceLabel = key === "source_a" ? "Shopify" : "Etsy";
                const dateStr = formatDateToEST(parseDate(d[xKey] as string));
                const value = Number(d[key]) || 0;
                const percentageOfTotal = data.reduce(
                  (total, item) => total + (Number(item[key]) || 0),
                  0,
                );
                const percentage = ((value / percentageOfTotal) * 100).toFixed(
                  1,
                );

                tooltip
                  .style("visibility", "visible")
                  .style("top", `${event.clientY - 10}px`)
                  .style("left", `${event.clientX + 10}px`).html(`
                    <div style="padding: 8px;">
                      <div style="font-weight: bold; margin-bottom: 8px; color: #333;">${dateStr}</div>
                      <div style="margin-bottom: 4px;">${sourceLabel}</div>
                      <div style="margin-bottom: 4px;">Sales: <strong>$${value.toFixed(
                        2,
                      )}</strong></div>
                      <div style="margin-bottom: 4px;">% of Total: <strong>${percentage}%</strong></div>
                      ${
                        d.order_count
                          ? `<div>Orders: <strong>${d.order_count}</strong></div>`
                          : ""
                      }
                    </div>
                  `);
              })
              .on("mouseout", function () {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("r", type === "line" ? 4 : 0)
                  .style("opacity", type === "line" ? 0.8 : 0);
                tooltip.style("visibility", "hidden");
              });
          });
        }

        // Add legend only if we have multiple sources
        if (yKeys.length > 1) {
          const legend = g
            .append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(yKeys)
            .enter()
            .append("g")
            .attr(
              "transform",
              (d, i) => `translate(${innerWidth + 20},${i * 25 + 20})`,
            );

          legend
            .append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", (d, i) => color(i.toString()));

          legend
            .append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text((d) => (d === "source_a" ? "Shopify" : "Etsy"));
        }
      }

      // Add title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(title);
    }, [data, type, xKey, yKey, width, height, margin, title, dateRange]);

    return (
      <Paper
        ref={ref}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ maxWidth: "100%", height: "auto" }}
          viewBox={`0 0 ${width} ${height}`}
        />
        <div ref={tooltipRef} />
      </Paper>
    );
  },
);

D3Chart.displayName = "D3Chart";

export default D3Chart;
