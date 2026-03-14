import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
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
    @Body() _body: { date: string; value: number; unit: string },
  ) {
    return {
      data: await this.metricService.create(
        userId ?? 'anonymous',
        _body.date,
        _body.value,
        _body.unit,
      ),
    };
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get chart data' })
  @Response('metric.chart')
  async getChart(@Headers('x-user-id') userId: string) {
    return {
      data: await this.metricService.getChartData(
        userId ?? 'anonymous',
        'distance',
        1,
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

  @Get()
  @ApiOperation({ summary: 'Get all metrics (offset pagination)' })
  @ResponsePaging('metric.list')
  async listOffset(
    @Headers('x-user-id') userId: string,
    @PaginationOffsetQuery({
      availableOrderBy: ['createdAt', 'date'],
    })
    pagination: IPaginationQueryOffsetParams,
  ) {
    return this.metricService.getListOffset(pagination, userId ?? 'anonymous');
  }
}
