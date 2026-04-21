from typing import Annotated
from fastmcp import FastMCP
from pydantic import Field
import pandas as pd

_df_cache = {}
csv_path = "C:\\claude\\mcp\\data.csv"
_df_cache["df"] = pd.read_csv(csv_path)

mcp = FastMCP("Analytics-MCP")


# 캐시에 저장된 DataFrame을 반환하는 함수
@mcp.tool(
    name="load_df",
    description="Load the DataFrame from the cache."
)
def load_df():
    """Load the cached DataFrame.

    Args:
        None

    Returns:
        The DataFrame stored in the cache under the "df" key.
    """
    if "df" not in _df_cache:
        raise ValueError("No DataFrame found in cache. Please save a DataFrame with save_df first.")
    return _df_cache["df"]


# DataFrame의 기본 정보(shape, dtypes 등)를 확인하는 함수
@mcp.tool(
    name="basic_data_check",
    description="Run a basic data check operation on the cached DataFrame. Supported operations: shape, dtypes, missing, columns, describe"
)
def basic_data_check(
    operation: Annotated[str, Field(description="The basic check operation to run: shape, dtypes, missing, columns, or describe.")]
):
    """Run a basic data check on the cached DataFrame.

    Args:
        operation: The basic check operation to run (shape, dtypes, missing, columns, describe).

    Returns:
        The result of the selected basic data check operation.
    """
    df = load_df()
    ops = {
        "shape": lambda: df.shape,
        "dtypes": lambda: df.dtypes,
        "missing": lambda: df.isnull().sum(),
        "columns": lambda: list(df.columns),
        "describe": lambda: df.describe(),
    }
    if operation not in ops:
        raise ValueError(f"Unsupported operation: {operation}")
    return ops[operation]()


# 특정 컬럼에 대한 고유값/빈도 분석을 수행하는 함수
@mcp.tool(
    name="column_data_check",
    description="Run a column-specific data check operation on the cached DataFrame. Supported operations: unique, value_counts"
)
def column_data_check(
    operation: Annotated[str, Field(description="The column-level check operation to run: unique or value_counts.")],
    column: Annotated[str, Field(description="The name of the column to analyze.")]
):
    """Run a column-specific data check on the cached DataFrame.

    Args:
        operation: The column-level check operation to run (unique, value_counts).
        column: The name of the column to analyze.

    Returns:
        The result of the selected column check operation.
    """
    df = load_df()
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found in DataFrame.")
    ops = {
        "unique": lambda: df[column].unique(),
        "value_counts": lambda: df[column].value_counts(),
    }
    if operation not in ops:
        raise ValueError(f"Unsupported operation: {operation}")
    return ops[operation]()


# 결측치/중복 제거 등 전처리를 수행하고 캐시를 갱신하는 함수
@mcp.tool(
    name="data_preprocess",
    description="Run a basic data preprocessing operation on the cached DataFrame and update the cache. Supported operations: dropna, drop_duplicates"
)
def data_preprocess(
    operation: Annotated[str, Field(description="The preprocessing operation to run: dropna or drop_duplicates.")]
):
    """Run a basic preprocessing operation on the cached DataFrame.

    Args:
        operation: The preprocessing operation to run (dropna, drop_duplicates).

    Returns:
        The preprocessed DataFrame after updating the cache.
    """
    df = load_df()
    ops = {
        "dropna": lambda: df.dropna(),
        "drop_duplicates": lambda: df.drop_duplicates(),
    }
    if operation not in ops:
        raise ValueError(f"Unsupported operation: {operation}")
    _df_cache["df"] = ops[operation]()
    return _df_cache["df"]


# 특정 컬럼의 조건값 기반 필터링을 수행하는 함수
@mcp.tool(
    name="col_data_analysis",
    description="Column-based data analysis. Supported operations: filter_gt (greater than), filter_eq (equal to), filter_lt (less than)"
)
def col_data_analysis(
    operation: Annotated[str, Field(description="The filtering operation to run: filter_gt, filter_eq, or filter_lt.")],
    column: Annotated[str, Field(description="The name of the column to apply the filter on.")],
    condition_value: Annotated[int, Field(description="The integer value used as the filter condition.")]
):
    """Run a column-based filtering analysis on the cached DataFrame.

    Args:
        operation: The filtering operation to run (filter_gt, filter_eq, filter_lt).
        column: The name of the column to apply the filter on.
        condition_value: The integer value used as the filter condition.

    Returns:
        The filtered DataFrame based on the selected operation.
    """
    df = load_df()
    ops = {
        "filter_gt": lambda: df[df[column] > condition_value],
        "filter_eq": lambda: df[df[column] == condition_value],
        "filter_lt": lambda: df[df[column] < condition_value],
    }
    if operation not in ops:
        raise ValueError(f"Unsupported operation: {operation}")
    return ops[operation]()


# 그룹 단위로 집계 통계를 계산하는 함수
@mcp.tool(
    name="group_data_analysis",
    description="Group-based data analysis. Supported operations: mean, max, sum, count"
)
def group_data_analysis(
    operation: Annotated[str, Field(description="The group aggregation operation to run: mean, max, sum, or count.")],
    group_column: Annotated[str, Field(description="The name of the column to group by.")],
    target_column: Annotated[str, Field(description="The name of the column to aggregate.")]
):
    """Run a group-based aggregation analysis on the cached DataFrame.

    Args:
        operation: The group aggregation operation to run (mean, max, sum, count).
        group_column: The name of the column to group by.
        target_column: The name of the column to aggregate.

    Returns:
        The aggregated result grouped by the specified column.
    """
    df = load_df()
    ops = {
        "mean": lambda: df.groupby(group_column)[target_column].mean(),
        "max": lambda: df.groupby(group_column)[target_column].max(),
        "sum": lambda: df.groupby(group_column)[target_column].sum(),
        "count": lambda: df.groupby(group_column)[target_column].count(),
    }
    if operation not in ops:
        raise ValueError(f"Unsupported operation: {operation}")
    return ops[operation]()


if __name__ == "__main__":
    mcp.run()
