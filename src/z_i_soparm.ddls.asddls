@EndUserText.label: 'SO Parameter'
define abstract entity Z_I_SOPARM
{
  @EndUserText.label: 'Sales Order'
//  @Consumption.valueHelpDefinition: [{ entity: { name: 'I_SalesOrderStdVH', element: 'SalesOrder' } }]
  salesorder      : abap.char( 10 );
 
}

