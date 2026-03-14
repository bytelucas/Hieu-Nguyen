import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricService } from '@modules/metric/services/metric.service';
import {
  Response,
  ResponsePaging,
} from '@common/response/decorators/response.decorator';
import {
  PaginationOffsetQuery,
  PaginationCursorQuery,
} from '@common/pagination/decorators/pagination.decorator';
import {
  IPaginationQueryOffsetParams,
  IPaginationQueryCursorParams,
} from '@common/pagination/interfaces/pagination.interface';
import { CreateMetricDto } from '@modules/metric/dtos/create-metric.dto';
import { GetMetricsDto } from '@modules/metric/dtos/get-metrics.dto';
import { GetChartDataDto } from '@modules/metric/dtos/get-chart-data.dto';

@ApiTags('metrics')
@Controller({
  path: 'metrics',
  version: '1',
})
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new metric entry' })
  @Response('metric.created')
  async create(
    @Headers('x-user-id') userId: string,
    @Body() body: CreateMetricDto,
  ) {
    return {
      data: await this.metricService.create(
        userId ?? 'anonymous',
        body.date,
        body.value,
        body.unit,
      ),
    };
  }

  @Get('chart')
  @ApiOperation({
    summary: 'Get chart data — latest entry per day within period',
  })
  @Response('metric.chart')
  async getChart(
    @Headers('x-user-id') userId: string,
    @Query() query: GetChartDataDto,
  ) {
    return {
      data: await this.metricService.getChartData(
        userId ?? 'anonymous',
        query.type,
        query.period,
        query.unit,
      ),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all metric entries by type (with optional unit conversion)',
  })
  @Response('metric.list')
  async getList(
    @Headers('x-user-id') userId: string,
    @Query() query: GetMetricsDto,
  ) {
    return {
      data: await this.metricService.getList(
        userId ?? 'anonymous',
        query.type,
        query.unit,
      ),
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'Get all metrics (cursor pagination)' })
  @ResponsePaging('metric.list')
  async listCursor(
    @Headers('x-user-id') userId: string,
    @PaginationCursorQuery({
      availableOrderBy: ['createdAt', 'date'],
      cursorField: 'id',
    })
    pagination: IPaginationQueryCursorParams,
  ) {
    return this.metricService.getListCursor(pagination, userId ?? 'anonymous');
  }
}
