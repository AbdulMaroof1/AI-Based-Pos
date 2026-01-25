
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ModulePermission
 * 
 */
export type ModulePermission = $Result.DefaultSelection<Prisma.$ModulePermissionPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ModulePermissions
 * const modulePermissions = await prisma.modulePermission.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ModulePermissions
   * const modulePermissions = await prisma.modulePermission.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.modulePermission`: Exposes CRUD operations for the **ModulePermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ModulePermissions
    * const modulePermissions = await prisma.modulePermission.findMany()
    * ```
    */
  get modulePermission(): Prisma.ModulePermissionDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ModulePermission: 'ModulePermission'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "modulePermission"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ModulePermission: {
        payload: Prisma.$ModulePermissionPayload<ExtArgs>
        fields: Prisma.ModulePermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModulePermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModulePermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          findFirst: {
            args: Prisma.ModulePermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModulePermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          findMany: {
            args: Prisma.ModulePermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>[]
          }
          create: {
            args: Prisma.ModulePermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          createMany: {
            args: Prisma.ModulePermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ModulePermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>[]
          }
          delete: {
            args: Prisma.ModulePermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          update: {
            args: Prisma.ModulePermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          deleteMany: {
            args: Prisma.ModulePermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModulePermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ModulePermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePermissionPayload>
          }
          aggregate: {
            args: Prisma.ModulePermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModulePermission>
          }
          groupBy: {
            args: Prisma.ModulePermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModulePermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ModulePermissionCountArgs<ExtArgs>
            result: $Utils.Optional<ModulePermissionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ModulePermission
   */

  export type AggregateModulePermission = {
    _count: ModulePermissionCountAggregateOutputType | null
    _min: ModulePermissionMinAggregateOutputType | null
    _max: ModulePermissionMaxAggregateOutputType | null
  }

  export type ModulePermissionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleName: string | null
    isEnabled: boolean | null
    enabledAt: Date | null
    disabledAt: Date | null
    enabledBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModulePermissionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleName: string | null
    isEnabled: boolean | null
    enabledAt: Date | null
    disabledAt: Date | null
    enabledBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModulePermissionCountAggregateOutputType = {
    id: number
    tenantId: number
    moduleName: number
    isEnabled: number
    enabledAt: number
    disabledAt: number
    enabledBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ModulePermissionMinAggregateInputType = {
    id?: true
    tenantId?: true
    moduleName?: true
    isEnabled?: true
    enabledAt?: true
    disabledAt?: true
    enabledBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModulePermissionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    moduleName?: true
    isEnabled?: true
    enabledAt?: true
    disabledAt?: true
    enabledBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModulePermissionCountAggregateInputType = {
    id?: true
    tenantId?: true
    moduleName?: true
    isEnabled?: true
    enabledAt?: true
    disabledAt?: true
    enabledBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ModulePermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModulePermission to aggregate.
     */
    where?: ModulePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModulePermissions to fetch.
     */
    orderBy?: ModulePermissionOrderByWithRelationInput | ModulePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModulePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModulePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModulePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ModulePermissions
    **/
    _count?: true | ModulePermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModulePermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModulePermissionMaxAggregateInputType
  }

  export type GetModulePermissionAggregateType<T extends ModulePermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateModulePermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModulePermission[P]>
      : GetScalarType<T[P], AggregateModulePermission[P]>
  }




  export type ModulePermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModulePermissionWhereInput
    orderBy?: ModulePermissionOrderByWithAggregationInput | ModulePermissionOrderByWithAggregationInput[]
    by: ModulePermissionScalarFieldEnum[] | ModulePermissionScalarFieldEnum
    having?: ModulePermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModulePermissionCountAggregateInputType | true
    _min?: ModulePermissionMinAggregateInputType
    _max?: ModulePermissionMaxAggregateInputType
  }

  export type ModulePermissionGroupByOutputType = {
    id: string
    tenantId: string
    moduleName: string
    isEnabled: boolean
    enabledAt: Date | null
    disabledAt: Date | null
    enabledBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: ModulePermissionCountAggregateOutputType | null
    _min: ModulePermissionMinAggregateOutputType | null
    _max: ModulePermissionMaxAggregateOutputType | null
  }

  type GetModulePermissionGroupByPayload<T extends ModulePermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModulePermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModulePermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModulePermissionGroupByOutputType[P]>
            : GetScalarType<T[P], ModulePermissionGroupByOutputType[P]>
        }
      >
    >


  export type ModulePermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleName?: boolean
    isEnabled?: boolean
    enabledAt?: boolean
    disabledAt?: boolean
    enabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modulePermission"]>

  export type ModulePermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleName?: boolean
    isEnabled?: boolean
    enabledAt?: boolean
    disabledAt?: boolean
    enabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modulePermission"]>

  export type ModulePermissionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    moduleName?: boolean
    isEnabled?: boolean
    enabledAt?: boolean
    disabledAt?: boolean
    enabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $ModulePermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ModulePermission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      moduleName: string
      isEnabled: boolean
      enabledAt: Date | null
      disabledAt: Date | null
      enabledBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["modulePermission"]>
    composites: {}
  }

  type ModulePermissionGetPayload<S extends boolean | null | undefined | ModulePermissionDefaultArgs> = $Result.GetResult<Prisma.$ModulePermissionPayload, S>

  type ModulePermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ModulePermissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ModulePermissionCountAggregateInputType | true
    }

  export interface ModulePermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ModulePermission'], meta: { name: 'ModulePermission' } }
    /**
     * Find zero or one ModulePermission that matches the filter.
     * @param {ModulePermissionFindUniqueArgs} args - Arguments to find a ModulePermission
     * @example
     * // Get one ModulePermission
     * const modulePermission = await prisma.modulePermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModulePermissionFindUniqueArgs>(args: SelectSubset<T, ModulePermissionFindUniqueArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ModulePermission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ModulePermissionFindUniqueOrThrowArgs} args - Arguments to find a ModulePermission
     * @example
     * // Get one ModulePermission
     * const modulePermission = await prisma.modulePermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModulePermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, ModulePermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ModulePermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionFindFirstArgs} args - Arguments to find a ModulePermission
     * @example
     * // Get one ModulePermission
     * const modulePermission = await prisma.modulePermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModulePermissionFindFirstArgs>(args?: SelectSubset<T, ModulePermissionFindFirstArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ModulePermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionFindFirstOrThrowArgs} args - Arguments to find a ModulePermission
     * @example
     * // Get one ModulePermission
     * const modulePermission = await prisma.modulePermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModulePermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, ModulePermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ModulePermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModulePermissions
     * const modulePermissions = await prisma.modulePermission.findMany()
     * 
     * // Get first 10 ModulePermissions
     * const modulePermissions = await prisma.modulePermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const modulePermissionWithIdOnly = await prisma.modulePermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModulePermissionFindManyArgs>(args?: SelectSubset<T, ModulePermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ModulePermission.
     * @param {ModulePermissionCreateArgs} args - Arguments to create a ModulePermission.
     * @example
     * // Create one ModulePermission
     * const ModulePermission = await prisma.modulePermission.create({
     *   data: {
     *     // ... data to create a ModulePermission
     *   }
     * })
     * 
     */
    create<T extends ModulePermissionCreateArgs>(args: SelectSubset<T, ModulePermissionCreateArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ModulePermissions.
     * @param {ModulePermissionCreateManyArgs} args - Arguments to create many ModulePermissions.
     * @example
     * // Create many ModulePermissions
     * const modulePermission = await prisma.modulePermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModulePermissionCreateManyArgs>(args?: SelectSubset<T, ModulePermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ModulePermissions and returns the data saved in the database.
     * @param {ModulePermissionCreateManyAndReturnArgs} args - Arguments to create many ModulePermissions.
     * @example
     * // Create many ModulePermissions
     * const modulePermission = await prisma.modulePermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ModulePermissions and only return the `id`
     * const modulePermissionWithIdOnly = await prisma.modulePermission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ModulePermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, ModulePermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ModulePermission.
     * @param {ModulePermissionDeleteArgs} args - Arguments to delete one ModulePermission.
     * @example
     * // Delete one ModulePermission
     * const ModulePermission = await prisma.modulePermission.delete({
     *   where: {
     *     // ... filter to delete one ModulePermission
     *   }
     * })
     * 
     */
    delete<T extends ModulePermissionDeleteArgs>(args: SelectSubset<T, ModulePermissionDeleteArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ModulePermission.
     * @param {ModulePermissionUpdateArgs} args - Arguments to update one ModulePermission.
     * @example
     * // Update one ModulePermission
     * const modulePermission = await prisma.modulePermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModulePermissionUpdateArgs>(args: SelectSubset<T, ModulePermissionUpdateArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ModulePermissions.
     * @param {ModulePermissionDeleteManyArgs} args - Arguments to filter ModulePermissions to delete.
     * @example
     * // Delete a few ModulePermissions
     * const { count } = await prisma.modulePermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModulePermissionDeleteManyArgs>(args?: SelectSubset<T, ModulePermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModulePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModulePermissions
     * const modulePermission = await prisma.modulePermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModulePermissionUpdateManyArgs>(args: SelectSubset<T, ModulePermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ModulePermission.
     * @param {ModulePermissionUpsertArgs} args - Arguments to update or create a ModulePermission.
     * @example
     * // Update or create a ModulePermission
     * const modulePermission = await prisma.modulePermission.upsert({
     *   create: {
     *     // ... data to create a ModulePermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModulePermission we want to update
     *   }
     * })
     */
    upsert<T extends ModulePermissionUpsertArgs>(args: SelectSubset<T, ModulePermissionUpsertArgs<ExtArgs>>): Prisma__ModulePermissionClient<$Result.GetResult<Prisma.$ModulePermissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ModulePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionCountArgs} args - Arguments to filter ModulePermissions to count.
     * @example
     * // Count the number of ModulePermissions
     * const count = await prisma.modulePermission.count({
     *   where: {
     *     // ... the filter for the ModulePermissions we want to count
     *   }
     * })
    **/
    count<T extends ModulePermissionCountArgs>(
      args?: Subset<T, ModulePermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModulePermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ModulePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ModulePermissionAggregateArgs>(args: Subset<T, ModulePermissionAggregateArgs>): Prisma.PrismaPromise<GetModulePermissionAggregateType<T>>

    /**
     * Group by ModulePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModulePermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ModulePermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModulePermissionGroupByArgs['orderBy'] }
        : { orderBy?: ModulePermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ModulePermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModulePermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ModulePermission model
   */
  readonly fields: ModulePermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ModulePermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModulePermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ModulePermission model
   */ 
  interface ModulePermissionFieldRefs {
    readonly id: FieldRef<"ModulePermission", 'String'>
    readonly tenantId: FieldRef<"ModulePermission", 'String'>
    readonly moduleName: FieldRef<"ModulePermission", 'String'>
    readonly isEnabled: FieldRef<"ModulePermission", 'Boolean'>
    readonly enabledAt: FieldRef<"ModulePermission", 'DateTime'>
    readonly disabledAt: FieldRef<"ModulePermission", 'DateTime'>
    readonly enabledBy: FieldRef<"ModulePermission", 'String'>
    readonly createdAt: FieldRef<"ModulePermission", 'DateTime'>
    readonly updatedAt: FieldRef<"ModulePermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ModulePermission findUnique
   */
  export type ModulePermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter, which ModulePermission to fetch.
     */
    where: ModulePermissionWhereUniqueInput
  }

  /**
   * ModulePermission findUniqueOrThrow
   */
  export type ModulePermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter, which ModulePermission to fetch.
     */
    where: ModulePermissionWhereUniqueInput
  }

  /**
   * ModulePermission findFirst
   */
  export type ModulePermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter, which ModulePermission to fetch.
     */
    where?: ModulePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModulePermissions to fetch.
     */
    orderBy?: ModulePermissionOrderByWithRelationInput | ModulePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModulePermissions.
     */
    cursor?: ModulePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModulePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModulePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModulePermissions.
     */
    distinct?: ModulePermissionScalarFieldEnum | ModulePermissionScalarFieldEnum[]
  }

  /**
   * ModulePermission findFirstOrThrow
   */
  export type ModulePermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter, which ModulePermission to fetch.
     */
    where?: ModulePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModulePermissions to fetch.
     */
    orderBy?: ModulePermissionOrderByWithRelationInput | ModulePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModulePermissions.
     */
    cursor?: ModulePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModulePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModulePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModulePermissions.
     */
    distinct?: ModulePermissionScalarFieldEnum | ModulePermissionScalarFieldEnum[]
  }

  /**
   * ModulePermission findMany
   */
  export type ModulePermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter, which ModulePermissions to fetch.
     */
    where?: ModulePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModulePermissions to fetch.
     */
    orderBy?: ModulePermissionOrderByWithRelationInput | ModulePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ModulePermissions.
     */
    cursor?: ModulePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModulePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModulePermissions.
     */
    skip?: number
    distinct?: ModulePermissionScalarFieldEnum | ModulePermissionScalarFieldEnum[]
  }

  /**
   * ModulePermission create
   */
  export type ModulePermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * The data needed to create a ModulePermission.
     */
    data: XOR<ModulePermissionCreateInput, ModulePermissionUncheckedCreateInput>
  }

  /**
   * ModulePermission createMany
   */
  export type ModulePermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModulePermissions.
     */
    data: ModulePermissionCreateManyInput | ModulePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModulePermission createManyAndReturn
   */
  export type ModulePermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ModulePermissions.
     */
    data: ModulePermissionCreateManyInput | ModulePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModulePermission update
   */
  export type ModulePermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * The data needed to update a ModulePermission.
     */
    data: XOR<ModulePermissionUpdateInput, ModulePermissionUncheckedUpdateInput>
    /**
     * Choose, which ModulePermission to update.
     */
    where: ModulePermissionWhereUniqueInput
  }

  /**
   * ModulePermission updateMany
   */
  export type ModulePermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ModulePermissions.
     */
    data: XOR<ModulePermissionUpdateManyMutationInput, ModulePermissionUncheckedUpdateManyInput>
    /**
     * Filter which ModulePermissions to update
     */
    where?: ModulePermissionWhereInput
  }

  /**
   * ModulePermission upsert
   */
  export type ModulePermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * The filter to search for the ModulePermission to update in case it exists.
     */
    where: ModulePermissionWhereUniqueInput
    /**
     * In case the ModulePermission found by the `where` argument doesn't exist, create a new ModulePermission with this data.
     */
    create: XOR<ModulePermissionCreateInput, ModulePermissionUncheckedCreateInput>
    /**
     * In case the ModulePermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModulePermissionUpdateInput, ModulePermissionUncheckedUpdateInput>
  }

  /**
   * ModulePermission delete
   */
  export type ModulePermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
    /**
     * Filter which ModulePermission to delete.
     */
    where: ModulePermissionWhereUniqueInput
  }

  /**
   * ModulePermission deleteMany
   */
  export type ModulePermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModulePermissions to delete
     */
    where?: ModulePermissionWhereInput
  }

  /**
   * ModulePermission without action
   */
  export type ModulePermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModulePermission
     */
    select?: ModulePermissionSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ModulePermissionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    moduleName: 'moduleName',
    isEnabled: 'isEnabled',
    enabledAt: 'enabledAt',
    disabledAt: 'disabledAt',
    enabledBy: 'enabledBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ModulePermissionScalarFieldEnum = (typeof ModulePermissionScalarFieldEnum)[keyof typeof ModulePermissionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ModulePermissionWhereInput = {
    AND?: ModulePermissionWhereInput | ModulePermissionWhereInput[]
    OR?: ModulePermissionWhereInput[]
    NOT?: ModulePermissionWhereInput | ModulePermissionWhereInput[]
    id?: StringFilter<"ModulePermission"> | string
    tenantId?: StringFilter<"ModulePermission"> | string
    moduleName?: StringFilter<"ModulePermission"> | string
    isEnabled?: BoolFilter<"ModulePermission"> | boolean
    enabledAt?: DateTimeNullableFilter<"ModulePermission"> | Date | string | null
    disabledAt?: DateTimeNullableFilter<"ModulePermission"> | Date | string | null
    enabledBy?: StringNullableFilter<"ModulePermission"> | string | null
    createdAt?: DateTimeFilter<"ModulePermission"> | Date | string
    updatedAt?: DateTimeFilter<"ModulePermission"> | Date | string
  }

  export type ModulePermissionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleName?: SortOrder
    isEnabled?: SortOrder
    enabledAt?: SortOrderInput | SortOrder
    disabledAt?: SortOrderInput | SortOrder
    enabledBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModulePermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_moduleName?: ModulePermissionTenantIdModuleNameCompoundUniqueInput
    AND?: ModulePermissionWhereInput | ModulePermissionWhereInput[]
    OR?: ModulePermissionWhereInput[]
    NOT?: ModulePermissionWhereInput | ModulePermissionWhereInput[]
    tenantId?: StringFilter<"ModulePermission"> | string
    moduleName?: StringFilter<"ModulePermission"> | string
    isEnabled?: BoolFilter<"ModulePermission"> | boolean
    enabledAt?: DateTimeNullableFilter<"ModulePermission"> | Date | string | null
    disabledAt?: DateTimeNullableFilter<"ModulePermission"> | Date | string | null
    enabledBy?: StringNullableFilter<"ModulePermission"> | string | null
    createdAt?: DateTimeFilter<"ModulePermission"> | Date | string
    updatedAt?: DateTimeFilter<"ModulePermission"> | Date | string
  }, "id" | "tenantId_moduleName">

  export type ModulePermissionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleName?: SortOrder
    isEnabled?: SortOrder
    enabledAt?: SortOrderInput | SortOrder
    disabledAt?: SortOrderInput | SortOrder
    enabledBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ModulePermissionCountOrderByAggregateInput
    _max?: ModulePermissionMaxOrderByAggregateInput
    _min?: ModulePermissionMinOrderByAggregateInput
  }

  export type ModulePermissionScalarWhereWithAggregatesInput = {
    AND?: ModulePermissionScalarWhereWithAggregatesInput | ModulePermissionScalarWhereWithAggregatesInput[]
    OR?: ModulePermissionScalarWhereWithAggregatesInput[]
    NOT?: ModulePermissionScalarWhereWithAggregatesInput | ModulePermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ModulePermission"> | string
    tenantId?: StringWithAggregatesFilter<"ModulePermission"> | string
    moduleName?: StringWithAggregatesFilter<"ModulePermission"> | string
    isEnabled?: BoolWithAggregatesFilter<"ModulePermission"> | boolean
    enabledAt?: DateTimeNullableWithAggregatesFilter<"ModulePermission"> | Date | string | null
    disabledAt?: DateTimeNullableWithAggregatesFilter<"ModulePermission"> | Date | string | null
    enabledBy?: StringNullableWithAggregatesFilter<"ModulePermission"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ModulePermission"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ModulePermission"> | Date | string
  }

  export type ModulePermissionCreateInput = {
    id?: string
    tenantId: string
    moduleName: string
    isEnabled?: boolean
    enabledAt?: Date | string | null
    disabledAt?: Date | string | null
    enabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModulePermissionUncheckedCreateInput = {
    id?: string
    tenantId: string
    moduleName: string
    isEnabled?: boolean
    enabledAt?: Date | string | null
    disabledAt?: Date | string | null
    enabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModulePermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    disabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModulePermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    disabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModulePermissionCreateManyInput = {
    id?: string
    tenantId: string
    moduleName: string
    isEnabled?: boolean
    enabledAt?: Date | string | null
    disabledAt?: Date | string | null
    enabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModulePermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    disabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModulePermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleName?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    disabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ModulePermissionTenantIdModuleNameCompoundUniqueInput = {
    tenantId: string
    moduleName: string
  }

  export type ModulePermissionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleName?: SortOrder
    isEnabled?: SortOrder
    enabledAt?: SortOrder
    disabledAt?: SortOrder
    enabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModulePermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleName?: SortOrder
    isEnabled?: SortOrder
    enabledAt?: SortOrder
    disabledAt?: SortOrder
    enabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModulePermissionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleName?: SortOrder
    isEnabled?: SortOrder
    enabledAt?: SortOrder
    disabledAt?: SortOrder
    enabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ModulePermissionDefaultArgs instead
     */
    export type ModulePermissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ModulePermissionDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}