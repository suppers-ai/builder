import {
  getApplyCondition,
  getValueCalculation,
  IFormulaResult,
  IPricingResult,
  IPricingVariable,
  IPurchaseContext,
  IVariableSources,
  VariableType,
  VariableUtils,
} from "./dynamic-pricing.ts";
import { PricingFormula } from "@suppers/shared";
import { Currency } from "./price.ts";

/**
 * Mathematical operators supported in formulas
 */
const OPERATORS = {
  // Arithmetic
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
  "*": (a: number, b: number) => a * b,
  "/": (a: number, b: number) => b !== 0 ? a / b : 0,
  "%": (a: number, b: number) => a % b,
  "^": (a: number, b: number) => Math.pow(a, b),

  // Comparison
  "==": (a: number, b: number) => a === b ? 1 : 0,
  "!=": (a: number, b: number) => a !== b ? 1 : 0,
  "<": (a: number, b: number) => a < b ? 1 : 0,
  "<=": (a: number, b: number) => a <= b ? 1 : 0,
  ">": (a: number, b: number) => a > b ? 1 : 0,
  ">=": (a: number, b: number) => a >= b ? 1 : 0,

  // Logical
  "&&": (a: number, b: number) => (a && b) ? 1 : 0,
  "||": (a: number, b: number) => (a || b) ? 1 : 0,
};

/**
 * Mathematical functions supported in formulas
 */
const FUNCTIONS = {
  abs: (x: number) => Math.abs(x),
  ceil: (x: number) => Math.ceil(x),
  floor: (x: number) => Math.floor(x),
  round: (x: number) => Math.round(x),
  min: (...args: number[]) => Math.min(...args),
  max: (...args: number[]) => Math.max(...args),
  sqrt: (x: number) => Math.sqrt(x),
  pow: (x: number, y: number) => Math.pow(x, y),

  // Conditional functions
  if: (condition: number, trueValue: number, falseValue: number) =>
    condition ? trueValue : falseValue,
};

/**
 * Formula evaluation engine with mathjs-like capabilities
 */
export class FormulaEvaluator {
  /**
   * Evaluate a complete pricing calculation
   */
  static evaluatePricing(
    formulas: Record<string, PricingFormula>,
    variableSources: IVariableSources,
    context: IPurchaseContext,
    currency: Currency,
    productVariables?: Record<string, IPricingVariable>,
  ): IPricingResult {
    // Merge all variables
    const allVariables = VariableUtils.mergeVariables(variableSources, context, productVariables);

    // Get formulas in the order they appear (priority is now based on formulaIds order)
    const sortedFormulas = Object.values(formulas);

    const appliedFormulas: IFormulaResult[] = [];
    let runningTotal = 0;
    let subtotal = 0;

    // Process each formula
    for (const formula of sortedFormulas) {
      const result = this.evaluateFormula(formula, allVariables, { subtotal, runningTotal });

      if (result.applied) {
        appliedFormulas.push(result);
        runningTotal += result.value;

        // Update subtotal before tax calculations
        if (formula.id !== "taxCalculation") {
          subtotal = runningTotal;
          // Make subtotal available for subsequent calculations
          allVariables.subtotal = {
            id: "subtotal",
            name: "Subtotal",
            type: VariableType.fixed,
            value: subtotal,
          };
        }
      }
    }

    // Generate calculation summary
    const calculation = this.generateCalculationSummary(appliedFormulas);

    return {
      finalPrice: Math.max(0, Math.round(runningTotal * 100) / 100),
      currency,
      appliedFormulas,
      allVariables,
      calculation,
    };
  }

  /**
   * Evaluate a single formula
   */
  static evaluateFormula(
    formula: PricingFormula,
    variables: Record<string, IPricingVariable>,
    calculationContext: { subtotal: number; runningTotal: number } = {
      subtotal: 0,
      runningTotal: 0,
    },
  ): IFormulaResult {
    const usedVariables: string[] = [];

    // Check apply condition first
    let conditionResult = true;
    const applyCondition = getApplyCondition(formula);
    if (applyCondition && applyCondition.length > 0) {
      try {
        conditionResult = this.evaluateExpression(
          applyCondition,
          variables,
          usedVariables,
          calculationContext,
        ) === 1;
      } catch (error) {
        console.warn(`Condition evaluation failed for formula ${formula.id}:`, error);
        conditionResult = false;
      }
    }

    let value = 0;
    let calculation = "";

    if (conditionResult) {
      try {
        const valueCalculation = getValueCalculation(formula);
        value = this.evaluateExpression(
          valueCalculation,
          variables,
          usedVariables,
          calculationContext,
        );
        calculation = this.expressionToString(valueCalculation, variables);
      } catch (error) {
        console.warn(`Value calculation failed for formula ${formula.id}:`, error);
        value = 0;
        calculation = "Error in calculation";
      }
    }

    return {
      formulaId: formula.id,
      formulaName: formula.name,
      value,
      applied: conditionResult,
      conditionResult,
      calculation,
      usedVariables: [...new Set(usedVariables)],
    };
  }

  /**
   * Evaluate an expression array (e.g., ["participants", "*", "basePrice", "+", "shippingCost"])
   */
  private static evaluateExpression(
    expression: (string | number)[],
    variables: Record<string, IPricingVariable>,
    usedVariables: string[],
    calculationContext: { subtotal: number; runningTotal: number },
  ): number {
    if (expression.length === 0) return 0;

    // Convert to postfix notation (Reverse Polish Notation) for evaluation
    const postfix = this.infixToPostfix(expression);

    // Evaluate postfix expression
    const stack: number[] = [];

    for (const token of postfix) {
      if (typeof token === "number") {
        stack.push(token);
      } else if (typeof token === "string") {
        // Check if it's a numeric string
        const numericValue = parseFloat(token);
        if (!isNaN(numericValue) && isFinite(numericValue)) {
          stack.push(numericValue);
          continue;
        }
        if (OPERATORS[token as keyof typeof OPERATORS]) {
          // Operator
          if (stack.length < 2) {
            throw new Error(`Insufficient operands for operator ${token}`);
          }
          const b = stack.pop()!;
          const a = stack.pop()!;
          const result = OPERATORS[token as keyof typeof OPERATORS](a, b);
          stack.push(result);
        } else if (FUNCTIONS[token as keyof typeof FUNCTIONS]) {
          // Function - handle different arities
          const func = FUNCTIONS[token as keyof typeof FUNCTIONS];
          if (token === "if") {
            // Special handling for if function (ternary)
            if (stack.length < 3) {
              throw new Error(`Insufficient arguments for function ${token}`);
            }
            const falseValue = stack.pop()!;
            const trueValue = stack.pop()!;
            const condition = stack.pop()!;
            const result = condition ? trueValue : falseValue;
            stack.push(result);
          } else if (token === "min" || token === "max") {
            // Handle variadic functions
            if (stack.length < 2) {
              throw new Error(`Insufficient arguments for function ${token}`);
            }
            const b = stack.pop()!;
            const a = stack.pop()!;
            const result = token === "min" ? Math.min(a, b) : Math.max(a, b);
            stack.push(result);
          } else if (token === "pow") {
            // Two argument function
            if (stack.length < 2) {
              throw new Error(`Insufficient arguments for function ${token}`);
            }
            const b = stack.pop()!;
            const a = stack.pop()!;
            const result = Math.pow(a, b);
            stack.push(result);
          } else {
            // Single argument functions
            if (stack.length < 1) {
              throw new Error(`Insufficient arguments for function ${token}`);
            }
            const arg = stack.pop()!;
            const result = (func as (x: number) => number)(arg);
            stack.push(result);
          }
        } else if (token === "subtotal") {
          stack.push(calculationContext.subtotal);
        } else if (token === "runningTotal") {
          stack.push(calculationContext.runningTotal);
        } else {
          // Variable
          const variable = variables[token];
          if (!variable) {
            throw new Error(`Variable not found: ${token}`);
          }
          usedVariables.push(token);
          stack.push(variable.value);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error(`Invalid expression: expected 1 result, got ${stack.length}`);
    }

    return stack[0];
  }

  /**
   * Convert infix notation to postfix (Reverse Polish Notation)
   */
  private static infixToPostfix(tokens: (string | number)[]): (string | number)[] {
    const output: (string | number)[] = [];
    const operators: string[] = [];

    const precedence: Record<string, number> = {
      "||": 1,
      "&&": 2,
      "==": 3,
      "!=": 3,
      "<": 4,
      "<=": 4,
      ">": 4,
      ">=": 4,
      "+": 5,
      "-": 5,
      "*": 6,
      "/": 6,
      "%": 6,
      "^": 7,
    };

    const rightAssociative = new Set(["^"]);

    for (const token of tokens) {
      if (typeof token === "number") {
        output.push(token);
      } else if (typeof token === "string") {
        // Check if it's a numeric string
        const numericValue = parseFloat(token);
        if (!isNaN(numericValue) && isFinite(numericValue)) {
          output.push(numericValue);
          continue;
        }
        if (token === "(") {
          operators.push(token);
        } else if (token === ")") {
          while (operators.length > 0 && operators[operators.length - 1] !== "(") {
            output.push(operators.pop()!);
          }
          if (operators.length === 0) {
            throw new Error("Mismatched parentheses");
          }
          operators.pop(); // Remove '('
        } else if (OPERATORS[token as keyof typeof OPERATORS]) {
          const prec = precedence[token] || 0;
          while (
            operators.length > 0 &&
            operators[operators.length - 1] !== "(" &&
            (
              precedence[operators[operators.length - 1]] > prec ||
              (precedence[operators[operators.length - 1]] === prec && !rightAssociative.has(token))
            )
          ) {
            output.push(operators.pop()!);
          }
          operators.push(token);
        } else {
          // Variable or function
          output.push(token);
        }
      }
    }

    while (operators.length > 0) {
      const op = operators.pop()!;
      if (op === "(" || op === ")") {
        throw new Error("Mismatched parentheses");
      }
      output.push(op);
    }

    return output;
  }

  /**
   * Convert expression array to human-readable string
   */
  private static expressionToString(
    expression: (string | number)[],
    variables: Record<string, IPricingVariable>,
  ): string {
    return expression.map((token) => {
      if (typeof token === "number") {
        return token.toString();
      } else if (typeof token === "string") {
        if (
          OPERATORS[token as keyof typeof OPERATORS] || FUNCTIONS[token as keyof typeof FUNCTIONS]
        ) {
          return token;
        } else {
          const variable = variables[token];
          return variable ? `${token}(${variable.value})` : token;
        }
      }
      return token;
    }).join(" ");
  }

  /**
   * Generate a human-readable calculation summary
   */
  private static generateCalculationSummary(appliedFormulas: IFormulaResult[]): string {
    if (appliedFormulas.length === 0) return "No formulas applied";

    const steps = appliedFormulas.map((formula) =>
      `${formula.formulaName}: ${formula.calculation} = ${formula.value}`
    );

    const total = appliedFormulas.reduce((sum, formula) => sum + formula.value, 0);

    return steps.join(" + ") + ` = ${total}`;
  }

  /**
   * Validate a formula expression
   */
  static validateExpression(expression: (string | number)[]): string[] {
    const errors: string[] = [];

    if (expression.length === 0) {
      errors.push("Expression cannot be empty");
      return errors;
    }

    let parenCount = 0;
    let expectOperand = true;

    for (let i = 0; i < expression.length; i++) {
      const token = expression[i];

      if (typeof token === "number") {
        if (!expectOperand) {
          errors.push(`Unexpected number at position ${i}`);
        }
        expectOperand = false;
      } else if (typeof token === "string") {
        if (token === "(") {
          parenCount++;
          expectOperand = true;
        } else if (token === ")") {
          parenCount--;
          if (parenCount < 0) {
            errors.push(`Mismatched closing parenthesis at position ${i}`);
          }
          expectOperand = false;
        } else if (OPERATORS[token as keyof typeof OPERATORS]) {
          if (expectOperand) {
            errors.push(`Unexpected operator '${token}' at position ${i}`);
          }
          expectOperand = true;
        } else if (FUNCTIONS[token as keyof typeof FUNCTIONS]) {
          if (!expectOperand) {
            errors.push(`Unexpected function '${token}' at position ${i}`);
          }
          expectOperand = false;
        } else {
          // Variable
          if (!expectOperand) {
            errors.push(`Unexpected variable '${token}' at position ${i}`);
          }
          expectOperand = false;
        }
      }
    }

    if (parenCount !== 0) {
      errors.push("Mismatched parentheses");
    }

    if (expectOperand && expression.length > 1) {
      errors.push("Expression ends with incomplete operation");
    }

    return errors;
  }
}
