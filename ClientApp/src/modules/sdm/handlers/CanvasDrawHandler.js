import * as d3 from 'd3';
import { ELEMENT_COLORS, ELEMENT_STROKE, SHAPE_STYLES, DRAG_CONFIG } from '../config/diagramStyles';

/**
 * Handles drawing new elements on the canvas
 */
export class CanvasDrawHandler {
  constructor(options) {
    this.selectedToolRef = options.selectedToolRef;
    this.mainGroup = options.mainGroup;
    this.addElement = options.addElement;
    
    // Drawing state
    this.drawStartX = null;
    this.drawStartY = null;
    this.drawElement = null;
    this.drawGroup = null;
  }

  /**
   * Creates and returns the D3 drag behavior for drawing
   */
  createDrawBehavior() {
    return d3.drag()
      .filter((event) => {
        if (this.selectedToolRef.current === 'select' || this.selectedToolRef.current === 'connect') {
          return false;
        }
        return !event.target.closest('.element');
      })
      .on('start', (event) => this.handleDrawStart(event))
      .on('drag', (event) => this.handleDrawDrag(event))
      .on('end', (event) => this.handleDrawEnd(event));
  }

  /**
   * Handles draw start
   */
  handleDrawStart(event) {
    const [x, y] = d3.pointer(event);
    this.drawStartX = x;
    this.drawStartY = y;
    
    this.drawGroup = this.mainGroup.append('g')
      .attr('class', 'drawing-element')
      .attr('transform', `translate(${x}, ${y})`);
    
    this.createTempShape();
  }

  /**
   * Creates temporary shape based on selected tool
   */
  createTempShape() {
    const type = this.selectedToolRef.current;
    
    if (type === 'start' || type === 'stop') {
      this.drawElement = this.drawGroup.append('rect')
        .attr('width', 0)
        .attr('height', 0)
        .attr('rx', SHAPE_STYLES.borderRadius)
        .attr('fill', type === 'start' ? ELEMENT_COLORS.start : ELEMENT_COLORS.stop)
        .attr('stroke', ELEMENT_STROKE.default.color)
        .attr('stroke-width', ELEMENT_STROKE.default.width)
        .attr('opacity', SHAPE_STYLES.opacity);
    } else if (type === 'process') {
      this.drawElement = this.drawGroup.append('rect')
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', ELEMENT_COLORS.process)
        .attr('stroke', ELEMENT_STROKE.default.color)
        .attr('stroke-width', ELEMENT_STROKE.default.width)
        .attr('opacity', SHAPE_STYLES.opacity);
    } else if (type === 'dataTemplate') {
      this.drawElement = this.drawGroup.append('rect')
        .attr('width', 0)
        .attr('height', 0)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', ELEMENT_COLORS.dataTemplate)
        .attr('stroke', ELEMENT_STROKE.default.color)
        .attr('stroke-width', ELEMENT_STROKE.default.width)
        .attr('opacity', SHAPE_STYLES.opacity);
    } else if (type === 'decision') {
      this.drawElement = this.drawGroup.append('polygon')
        .attr('points', '0,0')
        .attr('fill', ELEMENT_COLORS.decision)
        .attr('stroke', ELEMENT_STROKE.default.color)
        .attr('stroke-width', ELEMENT_STROKE.default.width)
        .attr('opacity', SHAPE_STYLES.opacity);
    }
  }

  /**
   * Handles draw drag
   */
  handleDrawDrag(event) {
    const [currentX, currentY] = d3.pointer(event);
    const width = Math.abs(currentX - this.drawStartX);
    const height = Math.abs(currentY - this.drawStartY);
    const x = Math.min(this.drawStartX, currentX);
    const y = Math.min(this.drawStartY, currentY);
    
    this.drawGroup.attr('transform', `translate(${x}, ${y})`);
    
    if (this.selectedToolRef.current === 'decision') {
      const points = [
        [width / 2, 0],
        [width, height / 2],
        [width / 2, height],
        [0, height / 2]
      ];
      this.drawElement.attr('points', points.map(p => p.join(',')).join(' '));
    } else {
      this.drawElement
        .attr('width', width)
        .attr('height', height);
    }
  }

  /**
   * Handles draw end
   */
  handleDrawEnd(event) {
    const [currentX, currentY] = d3.pointer(event);
    const width = Math.abs(currentX - this.drawStartX);
    const height = Math.abs(currentY - this.drawStartY);
    const x = Math.min(this.drawStartX, currentX);
    const y = Math.min(this.drawStartY, currentY);
    
    this.drawGroup.remove();
    
    if (width > DRAG_CONFIG.minDrawWidth && height > DRAG_CONFIG.minDrawHeight) {
      this.addElement(this.selectedToolRef.current, x, y, width, height);
    }
  }
}
