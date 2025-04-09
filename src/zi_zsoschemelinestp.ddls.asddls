@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Projection View forzsoschemelines'
define view entity ZI_zsoschemelinesTP
  as projection on ZR_zsoschemelinesTP as zsoschemelines
{
  key Bukrs,
  key Salesorder,
  key Schemecode,
  key Schemegroupcode,
  key Productcode,
  Schemecheckcode,
  Productdesc,
  Freeqty,
  CreatedBy,
  CreatedAt,
  LastChangedBy,
  LastChangedAt,
  LocalLastChangedAt,
  _zsoscheme : redirected to parent ZI_zsoscheme01TP
  
}
